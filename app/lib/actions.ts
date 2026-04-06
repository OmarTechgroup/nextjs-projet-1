'use server'
import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';



const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true })

const UpdateInvoice = InvoiceSchema.omit({ date: true })

export async function createInvoice(formtData: FormData) {

    const sql = postgres(process.env.POSTGRES_URL!)


    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formtData.get('customerId'),
        amount: formtData.get('amount'),
        status: formtData.get('status'),

    })

    const amountIncent = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`INSERT INTO invoices (customer_id,amount,status,date) VALUES
     (${customerId},${amountIncent},${status},${date})`

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')

}


export async function updateInvoice(id: string, formtData: FormData) {

    const sql = postgres(process.env.POSTGRES_URL!)


    const { customerId, amount, status } = UpdateInvoice.parse({
        id,
        customerId: formtData.get('customerId'),
        amount: formtData.get('amount'),
        status: formtData.get('status'),

    })

    const amountIncent = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountIncent}, status = ${status}, date = ${date} WHERE id = ${id}`

    revalidatePath('/dashboard/invoices')
    redirect('/dashboard/invoices')

}


export async function deleteInvoice(id: string) {
    const sql = postgres(process.env.POSTGRES_URL!)
    await sql`DELETE FROM invoices WHERE id = ${id}`
    revalidatePath('/dashboard/invoices')
}
