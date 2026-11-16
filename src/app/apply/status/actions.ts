'use server';

import { prisma } from '@/lib/prisma';

export async function checkApplicationStatusAction(applicationNo: string) {
  if (!applicationNo || !applicationNo.trim()) {
    return { error: 'Please enter a valid Application Reference Number.' };
  }

  try {
    const cleanRef = applicationNo.trim().toUpperCase();
    const app = await prisma.application.findUnique({
      where: { applicationNo: cleanRef },
      select: {
        applicationNo: true,
        firstName: true,
        lastName: true,
        targetForm: true,
        entryYear: true,
        status: true,
        chosenCombination: true,
        totalUnits: true,
        createdAt: true,
      },
    });

    if (!app) {
      return { error: `No application dossier found matching reference code "${cleanRef}". Please verify the number.` };
    }

    return { success: true, application: app };
  } catch (error: any) {
    return { error: 'Failed to retrieve application record. Please try again.' };
  }
}