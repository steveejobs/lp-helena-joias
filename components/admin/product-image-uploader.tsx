"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

const SOURCE_LIMIT = 20 * 1024 * 1024;
const MAX_DIMENSION = 2_400;

type PreparedImage = {
  file: File;
  height: number;
  originalSize: number;
  preview: string;
  width: number;
};

export function ProductImageUploader({
  action,
  productId,
  productName,
}: {
  action: (formData: FormData) => void | Promise<void>;
  productId: string;
  productName: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const prepare = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Escolha uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (!file.size || file.size > SOURCE_LIMIT) {
      setError("A foto original deve ter no máximo 20 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);
      if (width < 320 || height < 320) {
        bitmap.close();
        setError("A foto precisa ter pelo menos 320 pixels em cada lado.");
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("canvas_unavailable");
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
      if (!blob) throw new Error("conversion_failed");
      const safeName = file.name
        .replace(/\.[^.]+$/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "produto";
      const optimized = new File([blob], `${safeName}.webp`, { type: "image/webp" });
      const transfer = new DataTransfer();
      transfer.items.add(optimized);
      if (input.current) input.current.files = transfer.files;
      if (prepared) URL.revokeObjectURL(prepared.preview);
      setPrepared({
        file: optimized,
        height,
        originalSize: file.size,
        preview: URL.createObjectURL(blob),
        width,
      });
    } catch {
      setError("Não foi possível preparar essa foto. Tente exportá-la como JPEG ou PNG.");
    }
  };

  return (
    <form action={action} className="admin-smart-upload">
      <input type="hidden" name="productId" value={productId} />
      <div
        className={`admin-dropzone${dragging ? " is-dragging" : ""}${prepared ? " has-image" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void prepare(event.dataTransfer.files[0]);
        }}
      >
        {prepared ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={prepared.preview} alt="Prévia da foto preparada para envio" />
        ) : <span aria-hidden="true" className="admin-upload-symbol"><i /></span>}
        <div>
          <strong>{prepared ? "Foto pronta para enviar" : "Arraste a foto para cá"}</strong>
          <p>{prepared ? `${prepared.width} × ${prepared.height} px · ${fileSize(prepared.file.size)}` : "ou escolha uma foto do celular/computador"}</p>
          {prepared ? <small>Otimizada de {fileSize(prepared.originalSize)} para {fileSize(prepared.file.size)}</small> : null}
          <label className="admin-button admin-button-secondary">
            {prepared ? "Trocar foto" : "Escolher foto"}
            <input
              ref={input}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(event) => void prepare(event.target.files?.[0])}
              required
            />
          </label>
        </div>
      </div>
      <label className="admin-field">
        Como podemos descrever esta foto?
        <input name="altText" maxLength={240} defaultValue={`Detalhe de ${productName}`} required />
        <small>Essa descrição ajuda pessoas que usam leitor de tela.</small>
      </label>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      <UploadButton disabled={!prepared} />
    </form>
  );
}

function UploadButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending}>{pending ? "Enviando…" : "Adicionar foto"}</button>;
}

function fileSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
