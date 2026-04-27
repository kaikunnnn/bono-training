import { describe, it, expect } from "vitest";
import {
  TrainingError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  NetworkError,
  createErrorFromCode,
} from "@/lib/errors";

describe("Error Classes", () => {
  describe("TrainingError", () => {
    it("should create error with message and code", () => {
      const error = new TrainingError("Test error", "TEST_CODE");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe("TrainingError");
    });

    it("should accept custom status code", () => {
      const error = new TrainingError("Test error", "TEST_CODE", 400);
      expect(error.statusCode).toBe(400);
    });
  });

  describe("AuthError", () => {
    it("should create auth error with defaults", () => {
      const error = new AuthError();
      expect(error.message).toBe("ログインが必要です");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("AuthError");
    });

    it("should accept custom message", () => {
      const error = new AuthError("Custom auth message");
      expect(error.message).toBe("Custom auth message");
    });
  });

  describe("ForbiddenError", () => {
    it("should create forbidden error with defaults", () => {
      const error = new ForbiddenError();
      expect(error.message).toBe(
        "このコンテンツにアクセスする権限がありません"
      );
      expect(error.code).toBe("FORBIDDEN");
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe("ForbiddenError");
    });
  });

  describe("NotFoundError", () => {
    it("should create not found error with defaults", () => {
      const error = new NotFoundError();
      expect(error.message).toBe("コンテンツが見つかりませんでした");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("NotFoundError");
    });
  });

  describe("NetworkError", () => {
    it("should create network error with defaults", () => {
      const error = new NetworkError();
      expect(error.message).toBe("ネットワークエラーが発生しました");
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.statusCode).toBe(0);
      expect(error.name).toBe("NetworkError");
    });
  });

  describe("createErrorFromCode", () => {
    it("should create AuthError for UNAUTHORIZED code", () => {
      const error = createErrorFromCode("UNAUTHORIZED", "Custom message");
      expect(error).toBeInstanceOf(AuthError);
      expect(error.message).toBe("Custom message");
    });

    it("should create ForbiddenError for FORBIDDEN code", () => {
      const error = createErrorFromCode("FORBIDDEN");
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    it("should create NotFoundError for NOT_FOUND code", () => {
      const error = createErrorFromCode("NOT_FOUND");
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it("should create NetworkError for NETWORK_ERROR code", () => {
      const error = createErrorFromCode("NETWORK_ERROR");
      expect(error).toBeInstanceOf(NetworkError);
    });

    it("should create generic TrainingError for unknown code", () => {
      const error = createErrorFromCode("UNKNOWN_CODE", "Test message");
      expect(error).toBeInstanceOf(TrainingError);
      expect(error.code).toBe("UNKNOWN_CODE");
    });
  });
});
