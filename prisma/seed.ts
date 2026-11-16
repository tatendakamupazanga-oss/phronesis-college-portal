import 'dotenv/config';
import { PrismaClient, Role, StudentStatus, ResultStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Phronesis College database seeding...');

  // 1. Unified password hash for initial demo accounts ("Password123!")
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('Password123!', salt);

  // 2. Clean existing records in dependency order
  await prisma.auditLog.deleteMany();
  await prisma.bookLoan.deleteMany();
  await prisma.bookCopy.deleteMany();
  await prisma.book.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.examMark.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.enrolment.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.application.deleteMany();
  await prisma.student.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  // 3. Academic Structure (2027 Academic Year & 3 Terms)
  const currentYear = await prisma.academicYear.create({
    data: {
      year: 2027,
      isCurrent: true,
      terms: {
        create: [
          { name: 'Term 1', termNumber: 1, startDate: new Date('2027-01-12'), endDate: new Date('2027-04-08') },
          { name: 'Term 2', termNumber: 2, startDate: new Date('2027-05-11'), endDate: new Date('2027-08-05') },
          { name: 'Term 3', termNumber: 3, startDate: new Date('2027-09-07'), endDate: new Date('2027-12-02') },
        ],
      },
    },
    include: { terms: true },
  });

  const term1 = currentYear.terms.find((t) => t.termNumber === 1)!;

  // 4. Secondary Classes (Forms 1 to 6)
  const classesData = [
    { formLevel: 1, name: 'Form 1A' },
    { formLevel: 1, name: 'Form 1B' },
    { formLevel: 2, name: 'Form 2A' },
    { formLevel: 3, name: 'Form 3 Science' },
    { formLevel: 3, name: 'Form 3 Commercials' },
    { formLevel: 4, name: 'Form 4 Science' },
    { formLevel: 5, name: 'Form 5 Sciences' },
    { formLevel: 6, name: 'Form 6 Sciences' },
  ];

  const createdClasses: Record<string, string> = {};
  for (const c of classesData) {
    const created = await prisma.schoolClass.create({ data: c });
    createdClasses[c.name] = created.id;
  }

  // 5. ZIMSEC Secondary Subjects
  const subjectsData = [
    { code: 'ENG', name: 'English Language', description: 'Core ZIMSEC English syllabus' },
    { code: 'MATH', name: 'Mathematics', description: 'ZIMSEC Pure Mathematics' },
    { code: 'SCI', name: 'Combined Science', description: 'Core Biology, Chemistry, Physics' },
    { code: 'GEO', name: 'Geography', description: 'Physical and Human Geography' },
    { code: 'HIS', name: 'History', description: 'Zimbabwean and International History' },
    { code: 'COM', name: 'Commerce', description: 'Business & Commercial Studies' },
    { code: 'ACC', name: 'Principles of Accounts', description: 'Financial Accounting' },
    { code: 'PHY', name: 'Physics (A-Level)', description: 'Advanced Level Physical Science' },
    { code: 'CHEM', name: 'Chemistry (A-Level)', description: 'Advanced Level Chemistry' },
  ];

  const createdSubjects: Record<string, string> = {};
  for (const s of subjectsData) {
    const sub = await prisma.subject.create({ data: s });
    createdSubjects[s.code] = sub.id;
  }

  // 6. Administrative & Faculty Accounts
  // A. Admin / Headmaster
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@phronesiscollege.co.zw',
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      staff: {
        create: {
          staffNumber: 'PHRADM8K5',
          firstName: 'Tendai',
          lastName: 'Moyo',
          department: 'Executive Administration',
        },
      },
    },
  });

  // B. Teacher
  const teacherUser = await prisma.user.create({
    data: {
      username: 'teacher',
      email: 'tmupfumi@phronesiscollege.co.zw',
      passwordHash: defaultPassword,
      role: Role.TEACHER,
      staff: {
        create: {
          staffNumber: 'PHRTCH4M9',
          firstName: 'Farai',
          lastName: 'Mupfumi',
          department: 'Mathematics & Sciences',
        },
      },
    },
    include: { staff: true },
  });

  // C. Bursar / Finance Officer
  const financeUser = await prisma.user.create({
    data: {
      username: 'finance',
      email: 'bursar@phronesiscollege.co.zw',
      passwordHash: defaultPassword,
      role: Role.FINANCE,
      staff: {
        create: {
          staffNumber: 'PHRACC3B6',
          firstName: 'Kudzai',
          lastName: 'Musoni',
          department: 'Accounts & Bursary',
        },
      },
    },
  });

  // D. Librarian
  const librarianUser = await prisma.user.create({
    data: {
      username: 'librarian',
      email: 'library@phronesiscollege.co.zw',
      passwordHash: defaultPassword,
      role: Role.LIBRARIAN,
      staff: {
        create: {
          staffNumber: 'PHRLIB9R4',
          firstName: 'Ruvimbo',
          lastName: 'Chigwida',
          department: 'Curriculum & Library Vault',
        },
      },
    },
  });

  // 7. Student Accounts (Unpredictable, hyphen-free IDs)
  const studentsRaw = [
    { num: 'PHR27K8M4', first: 'Tafadzwa', last: 'Ndlovu', dob: new Date('2013-05-14'), class: 'Form 1A', form: 1 },
    { num: 'PHR27X2P9', first: 'Chipo', last: 'Marange', dob: new Date('2013-08-22'), class: 'Form 1A', form: 1 },
    { num: 'PHR27W5B3', first: 'Blessing', last: 'Mutasa', dob: new Date('2011-02-11'), class: 'Form 3 Science', form: 3 },
    { num: 'PHR27R9T6', first: 'Tariro', last: 'Sibanda', dob: new Date('2009-11-30'), class: 'Form 5 Sciences', form: 5 },
  ];

  const createdStudents = [];
  for (const s of studentsRaw) {
    const sUser = await prisma.user.create({
      data: {
        username: s.num.toLowerCase(), // students sign in with 'phr27k8m4'
        email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}.${s.num.toLowerCase()}@student.phronesis.ac.zw`,
        passwordHash: defaultPassword,
        role: Role.STUDENT,
        student: {
          create: {
            studentNumber: s.num,
            firstName: s.first,
            lastName: s.last,
            dateOfBirth: s.dob,
            admissionYear: 2027,
            status: StudentStatus.ENROLLED,
            enrolments: {
              create: {
                academicYear: 2027,
                schoolClassId: createdClasses[s.class],
              },
            },
          },
        },
      },
      include: { student: true },
    });
    createdStudents.push(sUser.student!);
  }

  // 8. Teaching Assignment
  await prisma.teachingAssignment.create({
    data: {
      staffId: teacherUser.staff!.id,
      subjectId: createdSubjects['MATH'],
      schoolClassId: createdClasses['Form 1A'],
      academicYear: 2027,
    },
  });

  // 9. Mid-Term Examination & Sample Marks
  const exam = await prisma.exam.create({
    data: {
      title: 'Term 1 Mid-Term Assessment 2027',
      examType: 'INTERNAL',
      termId: term1.id,
      marks: {
        create: [
          {
            studentId: createdStudents[0].id,
            subjectId: createdSubjects['MATH'],
            mark: 86,
            maxMark: 100,
            percentage: 86,
            gradeLetter: 'A',
            status: ResultStatus.PUBLISHED,
            teacherNotes: 'Demonstrated outstanding algebraic comprehension.',
          },
          {
            studentId: createdStudents[1].id,
            subjectId: createdSubjects['MATH'],
            mark: 72,
            maxMark: 100,
            percentage: 72,
            gradeLetter: 'B',
            status: ResultStatus.PUBLISHED,
            teacherNotes: 'Consistent problem solving and diligent approach.',
          },
        ],
      },
    },
  });

  // 10. Fee Structures ($410 total for new Form 1: Tuition $210, Uniforms $180, Reg $15, Stationery $5)
  await prisma.feeStructure.create({
    data: {
      academicYearId: currentYear.id,
      termId: term1.id,
      formLevel: 1,
      amount: 410.0,
      description: 'Form 1 Comprehensive Intake (Tuition $210, Uniforms $180, Reg $15, Stationery $5)',
    },
  });

  // Sample Invoice with Itemized Billing
  const sampleInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2027-T1-0001',
      studentId: createdStudents[0].id,
      termId: term1.id,
      totalDue: 410.0,
      balance: 110.0,
      items: {
        create: [
          { description: 'Term 1 Tuition Fee', amount: 210.0 },
          { description: 'Complete School Uniform Set', amount: 180.0 },
          { description: 'Registration Fee', amount: 15.0 },
          { description: 'School Stationery Pack', amount: 5.0 },
        ],
      },
      payments: {
        create: {
          receiptNo: 'REC-2027-0042',
          amountPaid: 300.0,
          method: 'EcoCash',
          reference: 'MP270114.1022.A49102',
        },
      },
    },
  });

  // 11. Library Vault Books & Copies
  const mathBook = await prisma.book.create({
    data: {
      isbn: '978-0-19-913876-0',
      title: 'New General Mathematics for Zimbabwe Book 1',
      author: 'J.B. Channon, A. McLeish Smith',
      subjectCode: 'MATH',
      copies: {
        create: [
          { barcode: 'LIB-MTH-001', status: 'BORROWED' },
          { barcode: 'LIB-MTH-002', status: 'AVAILABLE' },
        ],
      },
    },
    include: { copies: true },
  });

  await prisma.bookLoan.create({
    data: {
      bookCopyId: mathBook.copies[0].id,
      studentId: createdStudents[0].id,
      loanDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day duration
      status: 'ACTIVE',
    },
  });

  console.log('✅ Phronesis College database seeded successfully!');
  console.log('------------------------------------------------------------');
  console.log('FACULTY & ADMIN GATEWAY (/staff/gate):');
  console.log(' - Headmaster / Admin: username "admin"    (ID: PHRADM8K5)');
  console.log(' - Teacher:             username "teacher"  (ID: PHRTCH4M9)');
  console.log(' - Finance / Bursar:    username "finance"  (ID: PHRACC3B6)');
  console.log(' - Librarian:           username "librarian"(ID: PHRLIB9R4)');
  console.log(' Default Staff Password: Password123!');
  console.log('------------------------------------------------------------');
  console.log('STUDENT PORTAL (/login):');
  console.log(' - Tafadzwa Ndlovu:     username "phr27k8m4" (Form 1A)');
  console.log(' - Chipo Marange:       username "phr27x2p9" (Form 1A)');
  console.log(' - Blessing Mutasa:     username "phr27w5b3" (Form 3 Science)');
  console.log(' - Tariro Sibanda:      username "phr27r9t6" (Form 5 Science)');
  console.log(' Default Student Password: Password123!');
  console.log('------------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });