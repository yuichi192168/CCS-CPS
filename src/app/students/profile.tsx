import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentProfile({ student }: { student: any }) {
  if (!student) return <div>No student found.</div>;
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary">
            <AvatarImage src={student.imageUrl} />
            <AvatarFallback>{student.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{student.name}</CardTitle>
            <div className="text-sm text-muted-foreground">{student.email}</div>
            <div className="text-xs mt-1">ID: {student.id}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">Course / Strand</div>
            <div>{student.course}</div>
          </div>
          <div>
            <div className="font-semibold">Year Level</div>
            <div>{student.year}</div>
          </div>
          <div>
            <div className="font-semibold">Academic Year</div>
            <div>{student.academicYear}</div>
          </div>
          <div>
            <div className="font-semibold">Status</div>
            <Badge>{student.status}</Badge>
          </div>
        </div>
        <div>
          <div className="font-semibold">Academic History</div>
          <div className="text-sm text-muted-foreground">{student.academicHistory || "-"}</div>
        </div>
        <div>
          <div className="font-semibold">Non-Academic Activities</div>
          <div className="text-sm text-muted-foreground">{student.activities || "-"}</div>
        </div>
        <div>
          <div className="font-semibold">Violations</div>
          <div className="text-sm text-muted-foreground">{student.violations || "-"}</div>
        </div>
        <div>
          <div className="font-semibold">Skills</div>
          <div>
            {Array.isArray(student.skills) && student.skills.length > 0
              ? student.skills.map((skill: string, i: number) => (
                  <Badge key={i} className="mr-1 mb-1 inline-block" variant="secondary">{skill}</Badge>
                ))
              : "-"}
          </div>
        </div>
        <div>
          <div className="font-semibold">Affiliations</div>
          <div>
            {Array.isArray(student.affiliations) && student.affiliations.length > 0
              ? student.affiliations.map((aff: string, i: number) => (
                  <Badge key={i} className="mr-1 mb-1 inline-block" variant="outline">{aff}</Badge>
                ))
              : "-"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
