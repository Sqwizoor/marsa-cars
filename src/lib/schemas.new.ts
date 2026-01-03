import * as z from 'zod';

export const AddMemberSchema = z.object({ email: z.string().email('Invalid email address') });
