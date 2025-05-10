'use client';

import { useEffect, useState } from 'react';
import { useLinksStore } from '@/store/use-links-store';
import { useAuthStore } from '@/lib/hooks/use-auth-store';
import { LinkList } from './link-list';
import { LinkForm } from './link-form';
import { LinkDetail } from './link-detail';
import { Button } from '@/components/ui/button';
import { PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { 
  Sheet, 
  SheetContent, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';

type ActiveView = 'list' | 'detail' | 'form';

export function LinksDashboard() {
  const { isSignedIn } = useAuthStore();
  const [activeView, setActiveView] = useState<ActiveView>('list');
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  
  // Zustand store state and actions
  const { 
    links, 
    isLoading, 
    error, 
    selectedLinkId,
    fetchLinks,
    setSelectedLinkId,
    resetError
  } = useLinksStore();

  useEffect(() => {
    if (isSignedIn) {
      fetchLinks();
    }
  }, [isSignedIn, fetchLinks]);

  // Update the active view based on selection state
  useEffect(() => {
    if (selectedLinkId) {
      setActiveView('detail');
    } else {
      setActiveView('list');
    }
  }, [selectedLinkId]);

  const handleCreateNew = () => {
    setSelectedLinkId(null);
    setIsCreateSheetOpen(true);
  };

  const handleBackToList = () => {
    setSelectedLinkId(null);
    setActiveView('list');
  };

  const handleCreateSuccess = () => {
    setIsCreateSheetOpen(false);
    setActiveView('list');
  };

  if (!isSignedIn) {
    return (
      <div className="text-center">
        <p className="text-lg">Please sign in to manage your links</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              className="ml-2 p-0 h-auto" 
              onClick={resetError}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {activeView === 'detail' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToList}
              className="mr-2"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          )}
        </div>
        
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleCreateNew}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Link
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create New Link</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <LinkForm onSuccess={handleCreateSuccess} />
            </div>
            <SheetFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateSheetOpen(false)}
              >
                Cancel
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {/* Main content based on active view */}
      {!isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-border shadow-sm">
          {activeView === 'list' && links.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No links yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first link
              </p>
              <Button onClick={handleCreateNew}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </div>
          ) : (
            <>
              {activeView === 'list' && <LinkList />}
              {activeView === 'detail' && <LinkDetail />}
            </>
          )}
        </div>
      )}
    </div>
  );
} 