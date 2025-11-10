import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@clerk/nextjs/server";
import React from "react";

export default function UserInfo({ user }: { user: User | null }) {
  const role = user?.privateMetadata?.role?.toString() || "USER";
  const firstName = user?.firstName || "User";
  const lastName = user?.lastName || "";
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const imageUrl = user?.imageUrl || "";
  
  return (
    <div>
      <div>
        <Button className='w-full mt-5 mb-4 flex items-center justify-between py-10' variant="ghost">
          <div className="flex items-center text-left gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={imageUrl}
                alt={`${firstName} ${lastName}`}
              />
              <AvatarFallback className="bg-primary text-white">
                {firstName} {lastName}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-y-1">
              {firstName} {lastName}
              <span className="text-muted-foreground">
                {email}
              </span>
              <span className="w-left">
                <Badge variant="secondary" className="capitalize">
                  {role?.toLocaleLowerCase()} Dashboard
                </Badge>
              </span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
