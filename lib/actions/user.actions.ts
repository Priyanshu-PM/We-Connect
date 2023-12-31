"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDb } from "../mongoose"
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void> {

    connectToDb();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }    //  upsert means updating and inserting
        );
    
        if(path === '/profile/edit') {
            revalidatePath(path)
        }
        
    } catch (error: any) {
        throw new Error(`Failed to update/create user: ${error.message}`);
    }
    
}

export async function fetchUser(userId: string)
{
    try {
        connectToDb();
        return await User.findOne({id: userId});
        // .populate({
        //     path: 'communities',
        //     model: Community
        // })


    } catch (error: any) {
        
        throw new Error(`Failed to fetch user : ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
      connectToDb();
  
      // Find all threads authored by the user with the given userId
      const threads = await User.findOne({ id: userId }).populate({
        path: "threads",
        model: Thread,
        populate: [
          {
            path: "community",
            model: Community,
            select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "name image id", // Select the "name" and "_id" fields from the "User" model
            },
          },
        ],
      });
      return threads;
    } catch (error) {
      console.error("Error fetching user threads:", error);
      throw error;
    }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortby = "desc"
} : {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortby?: SortOrder
}) {

  try {
    
    connectToDb();
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId}
    }

    if(searchString.trim() !== '')
    {
      query.$or = [
        {username : { $regex : regex }},
        {name: { $regex: regex }}
      ]
    }

    const sortOptions = { createdAt: sortby };

    const usersQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize)

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount> skipAmount + users.length;

    return {users, isNext};

  } catch (error: any) {
    throw new Error(`Error fetching users : ${error.message}`)
  }
}

export async function getActivity(userId: string) {
  try {
    
    connectToDb();

    //  find all threads created by the user
    const userThreads = await Thread.find({author: userId});

    //  Collect all the child thread ids (replies) from the 'children' field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children)
    }, [])

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id'
    })

    return replies;

  } catch (error: any) {
      throw new Error(`Error fetching activity : ${error.message}`)
  }
}