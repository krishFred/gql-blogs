import { GraphQLError } from "graphql";
import { db } from ".";
import { CreateBlogInput, UpdateBlogInput } from "../generated/graphql";

export class Blog{

  


  /**
   * GET Blog by Id
   */
  public async getBlogById(id: string){
    return db.blog.findUnique({where: { id }});
  }


  /**
   * CREATE BLOG -
   */
  public async createBlog(input: CreateBlogInput){
    return db.blog.create({
      data: {
        authorId: input.authorId,
        content: input.content,
        title: input.title,
      }
    })
  }

  /**
   * UPDATE BLOG -
   */
  public async updateBlog(id: string, input: UpdateBlogInput){
    const blog = await this.getBlogById(id);
    if(!blog){
      throw new GraphQLError(`Could not find Blog`, {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }
    return db.blog.update({
      where: { id },
      data: {
        content: input.content?? blog.content,
        title: input.title?? blog.title,
      }
    })
  }
  
  /**
   * DELETE BLOG -
   */
  public async deleteBlog(id: string){
    const blog = await this.getBlogById(id);
    if(!blog){
      throw new GraphQLError(`Could not find Blog`, {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }
    return db.blog.delete({where: { id }});
  }
  
}