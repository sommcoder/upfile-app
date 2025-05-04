// components/MonacoClientOnly.tsx
import { useEffect, useState } from "react";

export default function MonacoClientOnly(props) {
  const [Editor, setEditor] = useState<any>(null);

  useEffect(() => {
    import("@monaco-editor/react").then((mod) => {
      setEditor(() => mod.default);
    });
  }, []);

  if (!Editor) return null; // Or return a fallback loader

  return <Editor {...props} />;
}
