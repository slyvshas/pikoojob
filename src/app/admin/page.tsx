import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Post a Job</CardTitle>
            <CardDescription>Create a new job listing</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/post-job">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Blog Post</CardTitle>
            <CardDescription>Write a new blog article</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/create-blog">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Create New Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 