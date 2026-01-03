"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AddMemberSchema } from "@/lib/schemas";
import { addStoreMember, removeStoreMember } from "@/queries/store-members";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface StoreMembersProps {
  storeUrl: string;
  members: User[];
  isOwner: boolean;
}

export const StoreMembers = ({ storeUrl, members, isOwner }: StoreMembersProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof AddMemberSchema>>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const onAddMember = async (values: z.infer<typeof AddMemberSchema>) => {
    try {
      setIsLoading(true);
      await addStoreMember(storeUrl, values.email);
      toast({
        title: "Success",
        description: "Member added successfully.",
      });
      form.reset();
      router.refresh();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
        });
    } finally {
      setIsLoading(false);
    }
  };

  const onRemoveMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      await removeStoreMember(storeUrl, memberId);
      toast({
        title: "Success",
        description: "Member removed successfully.",
      });
      router.refresh();
    } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage your store team members. They will have access to manage this store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isOwner && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddMember)} className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Add Member by Email</FormLabel>
                    <FormControl>
                      <Input placeholder="member@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </form>
          </Form>
        )}

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Current Members ({members.length})</h4>
          {members.length === 0 && (
              <p className="text-sm text-muted-foreground">No team members yet.</p>
          )}
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.picture} />
                  <AvatarFallback>{member.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              {isOwner && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveMember(member.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
