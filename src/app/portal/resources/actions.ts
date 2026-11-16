'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface CreateResourceInput {
  title: string;
  resourceType: 'Past Paper' | 'Syllabus' | 'Revision Note' | 'Marking Scheme';
  formLevel: number;
  subjectId: string;
  fileUrl: string;
}

export async function uploadResourceAction(input: CreateResourceInput) {
  const session = await getSession();

  // Guard: Only Teachers and Administrators can publish resources
  if (!session || (session.role !== Role.TEACHER && session.role !== Role.ADMIN)) {
    return { error: 'Unauthorized: Only teachers or administrators can upload resources.' };
  }

  try {
    const { title, resourceType, formLevel, subjectId, fileUrl } = input;

    if (!title?.trim() || !resourceType || !formLevel || !subjectId || !fileUrl?.trim()) {
      return { error: 'All fields are required.' };
    }

    const resource = await prisma.learningResource.create({
      data: {
        title: title.trim(),
        resourceType,
        formLevel: Number(formLevel),
        subjectId,
        fileUrl: fileUrl.trim(),
      },
      include: {
        subject: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'RESOURCE_PUBLISHED',
        details: `Published "${title}" (${resourceType}) for ${resource.subject.name} Form ${formLevel}.`,
      },
    });

    revalidatePath('/portal/resources');
    revalidatePath('/portal');

    return { success: true, resource };
  } catch (error: any) {
    console.error('Resource upload error:', error);
    return { error: error?.message || 'Failed to upload learning resource.' };
  }
}