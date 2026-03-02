'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, this will also trigger the Next.js error overlay
      // if the error is re-thrown or handled by the global error handler.
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: `You do not have permission to ${error.context.operation} at ${error.context.path}.`,
      });
      
      // Re-throw to trigger the dev overlay if needed
      if (process.env.NODE_ENV === 'development') {
        console.error('Firestore Permission Error:', error);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
