import { describe, it, expect } from "vitest";
import {
  validateTrainingMeta,
  validateTaskMeta,
  type Training,
  type Task,
  type TrainingFrontmatter,
  type TaskFrontmatter,
} from "@/types/training";

describe("Training Types", () => {
  describe("Training interface", () => {
    it("should have required fields", () => {
      const training: Training = {
        id: "test-1",
        slug: "test-training",
        title: "Test Training",
        description: "Test description",
        type: "challenge",
        difficulty: "normal",
        tags: ["test"],
      };

      expect(training.id).toBe("test-1");
      expect(training.slug).toBe("test-training");
      expect(training.type).toBe("challenge");
    });

    it("should accept optional fields", () => {
      const training: Training = {
        id: "test-1",
        slug: "test-training",
        title: "Test Training",
        description: "Test description",
        type: "skill",
        difficulty: "easy",
        tags: [],
        icon: "📚",
        category: "情報設計",
        thumbnailImage: "https://example.com/image.jpg",
      };

      expect(training.icon).toBe("📚");
      expect(training.category).toBe("情報設計");
    });
  });

  describe("Task interface", () => {
    it("should have required fields", () => {
      const task: Task = {
        id: "task-1",
        training_id: "training-1",
        slug: "task-slug",
        title: "Task Title",
        order_index: 1,
        is_premium: false,
        preview_sec: 30,
      };

      expect(task.id).toBe("task-1");
      expect(task.order_index).toBe(1);
      expect(task.is_premium).toBe(false);
    });
  });

  describe("validateTrainingMeta", () => {
    it("should validate valid training frontmatter", () => {
      const meta: TrainingFrontmatter = {
        title: "Test Training",
        description: "Test description",
        type: "challenge",
        difficulty: "normal",
        tags: ["ui", "design"],
      };

      const result = validateTrainingMeta(meta);
      expect(result.title).toBe("Test Training");
      expect(result.type).toBe("challenge");
    });

    it("should throw error for invalid frontmatter", () => {
      const invalidMeta = {
        // Missing required 'title' field
        description: "Test",
      };

      expect(() => validateTrainingMeta(invalidMeta)).toThrow();
    });
  });

  describe("validateTaskMeta", () => {
    it("should validate valid task frontmatter", () => {
      const meta: TaskFrontmatter = {
        title: "Task Title",
        slug: "task-slug",
        order_index: 1,
      };

      const result = validateTaskMeta(meta);
      expect(result.title).toBe("Task Title");
      expect(result.order_index).toBe(1);
    });

    it("should throw error for missing required fields", () => {
      const invalidMeta = {
        title: "Task Title",
        // Missing slug and order_index
      };

      expect(() => validateTaskMeta(invalidMeta)).toThrow();
    });
  });
});
