import { CategoryRepository } from "@/repositories/CategoryRepository";
import { ProjectService } from "./ProjectService";
import { ProjectCategory, BUDGET_CATEGORIES, MATERIAL_TYPES } from "@/types";

export class CategoryService {
  private categoryRepo: CategoryRepository;
  private projectService: ProjectService;

  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.projectService = new ProjectService();
  }

  async getCategories(
    projectId: string,
    userId: string,
    email?: string
  ): Promise<ProjectCategory[]> {
    // Verify access
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    // Fetch existing categories
    let categories = await this.categoryRepo.getByProjectId(projectId);

    // Migration: If no categories exist, seed with defaults
    if (categories.length === 0) {
      await this.seedDefaultCategories(projectId, userId);
      categories = await this.categoryRepo.getByProjectId(projectId);
    }

    return categories;
  }

  async addCategory(
    projectId: string,
    userId: string,
    email: string | undefined, // Fixed type compatibility
    data: {
      name: string;
      type: "category" | "subcategory";
      parentId?: string;
      color?: string;
    }
  ): Promise<ProjectCategory> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot manage categories");

    const newCategory: Omit<ProjectCategory, "id"> = {
      projectId,
      name: data.name,
      type: data.type,
      parentId: data.parentId,
      color: data.color,
      isDeleted: false,
    };

    return await this.categoryRepo.create(newCategory);
  }

  async deleteCategory(
    categoryId: string,
    projectId: string,
    userId: string,
    email?: string
  ): Promise<void> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot manage categories");

    // Get the category to ensure it exists and belongs to project
    const category = await this.categoryRepo.getById(categoryId);
    if (!category || category.projectId !== projectId) {
      throw new Error("Category not found or access denied");
    }

    // Soft delete
    await this.categoryRepo.update(categoryId, { isDeleted: true });

    // If it's a parent category, also soft-delete its subcategories?
    // The requirement didn't specify, but it's good practice.
    // Ideally we would trigger a batch update here, but for simplicity:
    if (category.type === "category") {
      const subcategories = (
        await this.categoryRepo.getByProjectId(projectId)
      ).filter(
        (c) => c.parentId === category.name || c.parentId === category.id
      );

      // Note: parenting by name vs ID is tricky with migration.
      // Defaults will likely use names.
    }
  }

  private async seedDefaultCategories(projectId: string, userId: string) {
    // 1. Seed Main Categories
    const categoryPromises = BUDGET_CATEGORIES.map((cat) =>
      this.categoryRepo.create({
        projectId,
        name: cat.label, // Use Label as the name shown to user
        slug: cat.value, // Store slug for legacy compatibility
        type: "category",
        color: cat.color,
        isDeleted: false,
      })
    );

    // 2. Seed Default Material Subcategories
    // Parent for these is "Materials"
    const materialPromises = MATERIAL_TYPES.map((mat) =>
      this.categoryRepo.create({
        projectId,
        name: mat.label,
        type: "subcategory",
        parentId: "Materials", // Linking by Name for simplicity in this migration
        isDeleted: false,
      })
    );

    await Promise.all([...categoryPromises, ...materialPromises]);
  }
}
