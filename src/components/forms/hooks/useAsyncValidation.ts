// import { useState, useEffect, useRef } from 'react';
// import debounce from 'lodash.debounce';
// import { logger } from '@/core/utils/logger';
// import { getConfig } from "@/config";
// import api from '@/services/http/api';

// // Get defaults from centralized config
// const { validation } = getConfig();

// export type AsyncValidationStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

// export interface AsyncValidationResult
// {
//     status: AsyncValidationStatus;
//     message?: string;
// }

// export interface AsyncValidationArgs
// {
//     service: string;
//     query?: string;
// }

// /**
//  * Hook for async field validation with debouncing.
//  *
//  * @param value - Current field value to validate
//  * @returns Validation result with status and message
//  */
// export function useAsyncValidation(value: string | undefined): AsyncValidationResult
// {
//     const [status, setStatus] = useState<AsyncValidationStatus>('idle');
//     const [message, setMessage] = useState<string | undefined>();
//     // const abortControllerRef = useRef<AbortController | null>(null); <== DO i need an abort controller?
//     const config = validation.async;
//     useEffect(() =>
//     {
//         // IF we have no value ir not enough character, then return.
//         if (!value || value.length < (config?.minInputLength ?? 1))
//         {
//             setStatus('idle');
//             setMessage(undefined);
//             return;
//         }

//         const run = async () =>
//         {
//             setStatus('checking');
//             try
//             {
//                 const res = await service(value);
//                 setStatus(res.status === 204 ? 'success' : 'error');
//             } catch
//             {
//                 setStatus('error');
//             }
//         };

//         const debounced = debounce(run, config?.debounceMs);
//         debounced();

//         return () => debounced.cancel();

//     }, [value, config]);

//     return { status, message };
// }
