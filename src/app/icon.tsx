import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  const file = join(process.cwd(), "public", "images", "rrise-parrot-logo.png");
  const data = readFileSync(file).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={`data:image/png;base64,${data}`}
          width={32}
          height={36}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
