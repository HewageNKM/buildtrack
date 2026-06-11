import { CommentRepository } from "@/repositories/CommentRepository";
import { ProjectService } from "./ProjectService";
import { EntryComment } from "@/types";

export class CommentService {
  private commentRepo: CommentRepository;
  private projectService: ProjectService;

  constructor() {
    this.commentRepo = new CommentRepository();
    this.projectService = new ProjectService();
  }

  async getComments(
    projectId: string,
    entryId: string,
    userId: string,
    email?: string
  ): Promise<EntryComment[]> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    return await this.commentRepo.getByEntryId(projectId, entryId);
  }

  async addComment(
    projectId: string,
    entryId: string,
    userId: string,
    userName: string,
    content: string,
    email?: string
  ): Promise<EntryComment> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    const comment: Omit<EntryComment, "id"> = {
      entryId,
      projectId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    };

    return await this.commentRepo.create(projectId, entryId, comment);
  }

  async deleteComment(
    projectId: string,
    entryId: string,
    commentId: string,
    userId: string,
    email?: string
  ): Promise<void> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    // Get the comment to verify ownership
    const comments = await this.commentRepo.getByEntryId(projectId, entryId);
    const comment = comments.find((c) => c.id === commentId);

    if (!comment) throw new Error("Comment not found");

    // Only owner or comment author can delete
    if (comment.userId !== userId && access.role !== "owner") {
      throw new Error("Cannot delete other users' comments");
    }

    await this.commentRepo.delete(projectId, entryId, commentId);
  }
}
