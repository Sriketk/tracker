'use client';

import { useParams, useRouter } from 'next/navigation';
import { parse, format, isValid } from 'date-fns';
import { NovelEditor } from '@/components/journal/novel-editor';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Check, Lock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { isNotToday, isFutureDate, daysBetween } from '@/lib/date';

export default function DayJournalPage() {
  const params = useParams();
  const router = useRouter();
  const [isValidDate, setIsValidDate] = useState(false);
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  // Calculate if date is locked (not today - must be called before early return for hook order)
  const isLocked = useMemo(() => {
    if (!parsedDate) return false;
    return isNotToday(parsedDate);
  }, [parsedDate]);

  // Calculate if date is in the future and days until it
  const isFuture = useMemo(() => {
    if (!parsedDate) return false;
    return isFutureDate(parsedDate);
  }, [parsedDate]);

  const daysUntil = useMemo(() => {
    if (!parsedDate || !isFuture) return 0;
    return daysBetween(new Date(), parsedDate);
  }, [parsedDate, isFuture]);

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
          <header className="container relative py-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="absolute left-4 h-9 w-9"
              aria-label="Back to calendar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="mx-auto flex max-w-4xl items-end justify-between">
              <div className="flex items-end gap-3">
                <h1 className="text-[2.25rem] leading-10 font-normal">{formattedDate}</h1>
                {isLocked && (
                  <Lock className="h-5 w-5 text-muted-foreground mb-1" aria-label="Read-only - Not today" />
                )}
              </div>
              <div className="flex items-end gap-3">
                <AnimatePresence mode="wait">
                  {isSaving && (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge variant="secondary" className="gap-1.5">
                        <Loader2 className="size-7 animate-spin" />
                        <span>Saving</span>
                      </Badge>
                    </motion.div>
                  )}
                  {isSaved && !isSaving && (
                    <motion.div
                      key="saved"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Badge variant="secondary" className="gap-1.5">
                        <Check className="size-7 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Saved</span>
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="container flex-1 pb-6">
            <div className="mx-auto max-w-4xl">
              {isFuture ? (
                <Empty className="min-h-[500px]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Calendar className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>
                      You have to wait {daysUntil} {daysUntil === 1 ? 'day' : 'days'} to edit this entry.
                    </EmptyTitle> 
                  </EmptyHeader>
                </Empty>
              ) : (
                <NovelEditor 
                  dateKey={dateKey}
                  editable={!isLocked}
                  onSaveStatusChange={(saving, saved) => {
                    setIsSaving(saving);
                    if (saved) {
                      setIsSaved(true);
                      // Hide saved icon after 2 seconds
                      setTimeout(() => {
                        setIsSaved(false);
                      }, 2000);
                    } else {
                      setIsSaved(false);
                    }
                  }}
                />
              )}
            </div>
          </main>
        </div>
      );
}

