import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const API_URL = `https://api.simpleswap.io/get_all_currencies?api_key=${process.env.SIMPLE_SWAP_API_KEY}`;

  console.log(process.env.SIMPLE_SWAP_API_KEY);

  try {
    const response = await fetch(API_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: errorData.message || "Unknown error from external API",
    //     },
    //     { status: response.status },
    //   );
    // }

    const resBody = await response.json();

    console.log(resBody);

    return NextResponse.json(resBody, {
      status: response.status,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
