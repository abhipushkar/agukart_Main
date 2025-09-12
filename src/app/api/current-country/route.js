import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const ip = (request.headers.get('x-forwarded-for')?.split(',')[0].trim()) ||
            request.ip ||
            '127.0.0.1';

        console.log("Real IP Address: ", ip, request, request.headers);

        let countryData = {};
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-country-by-ip?ip=${ip}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            countryData = await res.json();
            console.log("Location data", countryData);
        } catch (error) {
            console.error("Failed to fetch location data for IP", ip, error);
            return NextResponse.json(
                {
                    error: "Failed to fetch location data",
                    countryCode: "US",
                    countryName: "United States"
                },
                { status: 200 } // Still return 200 with fallback data
            );
        }

        const userCountry = countryData?.data?.country;
        const userCountryCode = countryData?.data?.country_code;

        console.log({ userCountry, userCountryCode });

        // Return the country information
        return NextResponse.json({
            countryCode: userCountryCode || "US",
            countryName: userCountry || "United States",
            ip: ip
        });

    } catch (error) {
        console.error("Error in current-country API:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                countryCode: "US",
                countryName: "United States"
            },
            { status: 500 }
        );
    }
}

// Optional: Add POST method if needed for other use cases
export async function POST(request) {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}
