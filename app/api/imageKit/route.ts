import ImageKit from "imagekit";
import config from "@/lib/config";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
    publicKey: config.env.imagekit.publicKey,
    privateKey: config.env.imagekit.privateKey,
    urlEndpoint: config.env.imagekit.urlEndpoint
});

export async function GET() {
   return NextResponse.json(imagekit.getAuthenticationParameters())
}
