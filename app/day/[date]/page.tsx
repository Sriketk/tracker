'use client';

import { useParams, useRouter } from 'next/navigation';
import { parse, format, isValid } from 'date-fns';
import { NovelEditor } from '@/components/journal/novel-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DayJournalPage() {
  const params = useParams();
  const router = useRouter();
  const [isValidDate, setIsValidDate] = useState(false);
  const [parsedDate, setParsedDate] = useState<Date | null>(null);

  // Parse and validate date from route params
  useEffect(() => {
    const dateParam = params.date as string;
    
    if (!dateParam || typeof dateParam !== 'string') {
      router.push('/');
      return;
    }

    // Parse date in YYYY-MM-DD format
    const date = parse(dateParam, 'yyyy-MM-dd', new Date());
    
    if (!isValid(date)) {
      router.push('/');
      return;
    }

    setParsedDate(date);
    setIsValidDate(true);
  }, [params.date, router]);

  if (!isValidDate || !parsedDate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const dateKey = format(parsedDate, 'yyyy-MM-dd');
  const formattedDate = format(parsedDate, 'EEEE, MMMM d, yyyy');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to calendar</span>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{formattedDate}</h1>
            <p className="text-sm text-muted-foreground">Daily Journal</p>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-6">
        <div className="mx-auto max-w-4xl">
          <NovelEditor dateKey={dateKey} />
        </div>
      </main>
    </div>
  );
}

