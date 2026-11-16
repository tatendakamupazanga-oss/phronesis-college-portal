'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function generateApplicationNumber(year: number): Promise<string> {
  const prefix = `APP-${year}-`;
  const count = await prisma.application.count({
    where: { entryYear: year },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

export interface SubmitApplicationPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  targetForm: number;
  entryYear: number;
  previousSchool: string;
  chosenCombination?: string;

  // Form 1
  grade7IndexNo?: string;
  englishUnits?: number;
  mathUnits?: number;
  generalPaperUnits?: number;
  indigenousUnits?: number;

  // Forms 2-4
  previousClass?: string;
  previousAverage?: number;
  previousPosition?: string;

  // Forms 5-6
  oLevelCandidateNo?: string;
  oLevelPassesCount?: number;
  oLevelSummaryGrades?: string;

  // Guardian
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianAddress: string;
}

export async function submitApplicationAction(input: SubmitApplicationPayload) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      targetForm,
      entryYear,
      previousSchool,
      chosenCombination,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianAddress,
    } = input;

    if (!firstName || !lastName || !dateOfBirth || !guardianName || !guardianPhone || !guardianAddress || !previousSchool) {
      return { error: 'Please fill in all mandatory candidate and guardian details.' };
    }

    const applicationNo = await generateApplicationNumber(entryYear || 2027);

    // Level-specific logic
    let totalUnits: number | null = null;
    let englishUnits: number | null = null;
    let mathUnits: number | null = null;
    let generalPaperUnits: number | null = null;
    let indigenousUnits: number | null = null;

    if (Number(targetForm) === 1) {
      englishUnits = Number(input.englishUnits || 1);
      mathUnits = Number(input.mathUnits || 1);
      generalPaperUnits = Number(input.generalPaperUnits || 1);
      indigenousUnits = Number(input.indigenousUnits || 1);

      if ([englishUnits, mathUnits, generalPaperUnits, indigenousUnits].some((u) => u < 1 || u > 9)) {
        return { error: 'Grade 7 units must be between 1 and 9 for each subject.' };
      }
      totalUnits = englishUnits + mathUnits + generalPaperUnits + indigenousUnits;
    }

    const application = await prisma.application.create({
      data: {
        applicationNo,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        targetForm: Number(targetForm),
        entryYear: Number(entryYear),
        previousSchool: previousSchool.trim(),
        chosenCombination: chosenCombination || (Number(targetForm) <= 2 ? 'General ZJC Curriculum' : null),

        // Form 1
        grade7IndexNo: input.grade7IndexNo?.trim() || null,
        englishUnits,
        mathUnits,
        generalPaperUnits,
        indigenousUnits,
        totalUnits,

        // Forms 2-4
        previousClass: input.previousClass?.trim() || null,
        previousAverage: input.previousAverage ? Number(input.previousAverage) : null,
        previousPosition: input.previousPosition?.trim() || null,

        // Forms 5-6
        oLevelCandidateNo: input.oLevelCandidateNo?.trim() || null,
        oLevelPassesCount: input.oLevelPassesCount ? Number(input.oLevelPassesCount) : null,
        oLevelSummaryGrades: input.oLevelSummaryGrades?.trim() || null,

        // Guardian
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail?.trim() || null,
        guardianAddress: guardianAddress.trim(),
      },
    });

    revalidatePath('/portal/admissions');

    return {
      success: true,
      applicationNo: application.applicationNo,
      targetForm: application.targetForm,
      chosenCombination: application.chosenCombination,
    };
  } catch (error: any) {
    console.error('Admission submit error:', error);
    return { error: error?.message || 'Failed to submit application.' };
  }
}