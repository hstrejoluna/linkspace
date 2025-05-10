'use client';

import { useState, useEffect } from 'react';
import { useLinksStore } from '@/store/use-links-store';
import { LinkForm } from './link-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ExternalLinkIcon, 
  TagIcon, 
  ClipboardIcon, 
  CheckIcon, 
  BarChart3Icon, 
  EyeIcon,
  EyeOffIcon,
  HistoryIcon,
  Globe2Icon
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export function LinkDetail() {
  const { selectedLink, selectedLinkId, fetchLinkById, isLoading } = useLinksStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (selectedLinkId && !selectedLink) {
      fetchLinkById(selectedLinkId);
    }
  }, [selectedLinkId, selectedLink, fetchLinkById]);

  const handleCopyLink = () => {
    if (!selectedLink) return;
    
    navigator.clipboard.writeText(selectedLink.url);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleOpenLink = () => {
    if (!selectedLink) return;
    window.open(selectedLink.url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !selectedLink) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedLink.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <a href={selectedLink.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                      {selectedLink.url}
                      <ExternalLinkIcon className="h-3 w-3 ml-1" />
                    </a>
                  </CardDescription>
                </div>
                <Badge variant={selectedLink.isPublic ? "outline" : "secondary"}>
                  {selectedLink.isPublic ? (
                    <><EyeIcon className="h-3 w-3 mr-1" /> Public</>
                  ) : (
                    <><EyeOffIcon className="h-3 w-3 mr-1" /> Private</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {selectedLink.description || "No description provided"}
                </p>
              </div>
              
              {selectedLink.tags && selectedLink.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedLink.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">Created</span>
                  <span className="flex items-center text-sm">
                    <HistoryIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                    {format(new Date(selectedLink.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">Clicks</span>
                  <span className="flex items-center text-sm">
                    <BarChart3Icon className="h-3 w-3 mr-1 text-muted-foreground" />
                    {selectedLink.clicks}
                  </span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCopyLink}
                className="text-xs" 
              >
                {copied ? (
                  <><CheckIcon className="h-3 w-3 mr-1" /> Copied</>
                ) : (
                  <><ClipboardIcon className="h-3 w-3 mr-1" /> Copy URL</>
                )}
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleOpenLink}
                className="text-xs" 
              >
                <Globe2Icon className="h-3 w-3 mr-1" /> Open Link
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analytics Coming Soon</CardTitle>
              <CardDescription>
                Detailed analytics for your link will be available in the future
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="bg-muted p-3 rounded-md">
                  <BarChart3Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Clicks</p>
                  <p className="text-2xl font-bold">{selectedLink.clicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Link</CardTitle>
              <CardDescription>
                Update the details of your link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LinkForm linkId={selectedLink.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Link Analytics</CardTitle>
              <CardDescription>
                View detailed analytics for your link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                Analytics feature coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 