"use client";

import * as z from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// import Image from "next/image";
// import { ChangeEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
// import { isBase64Image } from "@/lib/utils";
// import { useUploadThing } from '@/lib/uploadthing'
import { usePathname, useRouter } from "next/navigation";
// import { updateUser } from "@/lib/actions/user.actions";
// import { UserValidation } from "@/lib/validations/user";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
        }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {

        await addCommentToThread( threadId, values.thread, JSON.parse(currentUserId), pathname);

        form.reset();
    };

    return (
        <Form {...form}>
            <form
             onSubmit={form.handleSubmit(onSubmit)}
              className="comment-form items-center justify-center"
            >
                <FormField
                control={form.control}
                name="thread"
                render={({ field }) => (
                    <FormItem className="flex flex-row gap-3 w-full">
                        <FormLabel className="text-base-semibold text-light-2">
                            <Image 
                              src={currentUserImg} 
                              alt="Profile Photo"
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                            />
                        </FormLabel>
                        <FormControl className="border-none bg-transparent">
                            <Input
                                type="text"
                                placeholder="Comment..."
                                className="no-focus text-light-1 outline-none"
                                {...field}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            <Button type="submit" className="">Reply</Button>

            </form>
        </Form>
    )
};

export default Comment;