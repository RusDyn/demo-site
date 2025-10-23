import assert from "node:assert/strict";
import test from "node:test";

const expectedSignedUrl = "https://example.com/signed";

test("returns a signed URL when Supabase succeeds", async () => {
  const mockClient = {
    storage: {
      getBucket: () => Promise.resolve({ data: {} }),
      createBucket: () => Promise.resolve({}),
      from: () => ({
        upload: () => Promise.resolve({ data: {}, error: null }),
        createSignedUrl: () =>
          Promise.resolve({ data: { signedURL: expectedSignedUrl }, error: null }),
      }),
    },
  } as const;

  const { uploadToSupabase } = await import("../app/actions/upload");

  const originalBucket = process.env.SUPABASE_STORAGE_BUCKET;
  process.env.SUPABASE_STORAGE_BUCKET = "test-bucket";

  try {
    const file = new File(["test"], "example.txt", { type: "text/plain" });
    const result = await uploadToSupabase(file, undefined, mockClient);

    assert.equal(result.success, true);
    assert.equal(result.signedUrl, expectedSignedUrl);
    assert.match(result.path, /example.txt$/);
  } finally {
    process.env.SUPABASE_STORAGE_BUCKET = originalBucket;
  }
});
