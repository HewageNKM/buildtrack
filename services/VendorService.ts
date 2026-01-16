import { VendorRepository } from "@/repositories/VendorRepository";
import { ProjectService } from "./ProjectService";
import { Vendor } from "@/types";

export class VendorService {
  private vendorRepo: VendorRepository;
  private projectService: ProjectService;

  constructor() {
    this.vendorRepo = new VendorRepository();
    this.projectService = new ProjectService();
  }

  async getVendors(
    projectId: string,
    userId: string,
    email?: string
  ): Promise<Vendor[]> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    return await this.vendorRepo.getByProjectId(projectId);
  }

  async addVendor(
    projectId: string,
    userId: string,
    email: string | undefined,
    data: Omit<Vendor, "id" | "projectId" | "createdAt" | "updatedAt">
  ): Promise<Vendor> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot manage vendors");

    const vendor: Omit<Vendor, "id"> = {
      ...data,
      projectId,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };

    return await this.vendorRepo.create(projectId, vendor);
  }

  async updateVendor(
    projectId: string,
    vendorId: string,
    userId: string,
    email: string | undefined,
    data: Partial<Vendor>
  ): Promise<Vendor> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot manage vendors");

    const vendor = await this.vendorRepo.getById(projectId, vendorId);
    if (!vendor) throw new Error("Vendor not found");

    return await this.vendorRepo.update(projectId, vendorId, data);
  }

  async deleteVendor(
    projectId: string,
    vendorId: string,
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
      throw new Error("Viewers cannot manage vendors");

    await this.vendorRepo.delete(projectId, vendorId);
  }
}
