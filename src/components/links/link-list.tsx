'use client';

import { useState, useMemo } from 'react';
import { useLinksStore } from '@/store/use-links-store';
import { Link } from '@/lib/models';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ExternalLinkIcon, 
  EyeIcon, 
  EyeOffIcon, 
  MoreVerticalIcon, 
  PencilIcon, 
  TagIcon, 
  TrashIcon,
  SlidersHorizontalIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type SortField = 'createdAt' | 'title' | 'clicks';
type SortOrder = 'asc' | 'desc';

export function LinkList() {
  const { links, setSelectedLinkId, deleteLink } = useLinksStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    let result = [...links];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        link => 
          link.title.toLowerCase().includes(query) || 
          link.description?.toLowerCase()?.includes(query) ||
          link.url.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortOrder === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'title') {
        return sortOrder === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      } else if (sortField === 'clicks') {
        return sortOrder === 'desc'
          ? b.clicks - a.clicks
          : a.clicks - b.clicks;
      }
      return 0;
    });
    
    return result;
  }, [links, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleView = (id: string) => {
    setSelectedLinkId(id);
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (id: string) => {
    setLinkToDelete(null);
    await deleteLink(id);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontalIcon className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSort('createdAt')} className="flex justify-between">
              Date Added
              {getSortIcon('createdAt')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('title')} className="flex justify-between">
              Title
              {getSortIcon('title')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('clicks')} className="flex justify-between">
              Popularity
              {getSortIcon('clicks')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredLinks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No links found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <LinkCard 
              key={link.id} 
              link={link}
              onView={() => handleView(link.id)}
              onOpen={() => handleOpenLink(link.url)}
              onDelete={() => setLinkToDelete(link.id)}
            />
          ))}
        </div>
      )}
      
      <AlertDialog open={!!linkToDelete} onOpenChange={() => setLinkToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the link
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => linkToDelete && handleDelete(linkToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface LinkCardProps {
  link: Link;
  onView: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

function LinkCard({ link, onView, onOpen, onDelete }: LinkCardProps) {
  const timeAgo = formatDistanceToNow(new Date(link.createdAt), { addSuffix: true });
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-1 mr-6">
            {link.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-3 right-3">
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <PencilIcon className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpen}>
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                Open Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-500 focus:text-red-500"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-xs truncate">
          {link.url}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {link.description || "No description"}
        </p>
        
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {link.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <span className="mr-1">{link.clicks}</span>
            <span>clicks</span>
          </div>
          <time dateTime={link.createdAt.toString()}>{timeAgo}</time>
        </div>
        
        <Badge variant={link.isPublic ? "outline" : "secondary"} className="text-xs">
          {link.isPublic ? (
            <><EyeIcon className="h-3 w-3 mr-1" /> Public</>
          ) : (
            <><EyeOffIcon className="h-3 w-3 mr-1" /> Private</>
          )}
        </Badge>
      </CardFooter>
    </Card>
  );
} 