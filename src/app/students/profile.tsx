import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png";

export default function StudentProfile({ student }: { student: any }) {
  if (!student) return <div>No student found.</div>;
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 ring-2 ring-primary">
                <AvatarImage src={student.imageUrl || CCS_LOGO} />
                <AvatarFallback>{student.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="break-words text-xl font-bold sm:text-2xl">{student.name}</CardTitle>
                <div className="break-all text-sm text-muted-foreground">{student.email}</div>
                <div className="mt-1 text-xs">ID: {student.id}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Course / Strand</div>
                <div className="mt-1 break-words text-sm">{student.course || "-"}</div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Year Level</div>
                <div className="mt-1 break-words text-sm">{student.year || "-"}</div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Academic Year</div>
                <div className="mt-1 break-words text-sm">{student.academicYear || "-"}</div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-1">
                  <Badge>{student.status || "-"}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold">Academic History</div>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">{student.academicHistory || "-"}</div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold">Non-Academic Activities</div>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">{student.activities || "-"}</div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold">Violations</div>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">{student.violations || "-"}</div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold">Skills</div>
              <div className="rounded-lg border p-3">
                {Array.isArray(student.skills) && student.skills.length > 0
                  ? student.skills.map((skill: string, i: number) => (
                      <Badge key={i} className="mb-1 mr-1" variant="secondary">{skill}</Badge>
                    ))
                  : <span className="text-sm text-muted-foreground">-</span>}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold">Affiliations</div>
              <div className="rounded-lg border p-3">
                {Array.isArray(student.affiliations) && student.affiliations.length > 0
                  ? student.affiliations.map((aff: string, i: number) => (
                      <Badge key={i} className="mb-1 mr-1" variant="outline">{aff}</Badge>
                    ))
                  : <span className="text-sm text-muted-foreground">-</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
