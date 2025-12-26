import { fetch } from 'undici';

export async function GET(): Promise<Response> {
    console.log("Triggering rebuild...");
    const res = await fetch('https://api.vercel.com/v1/integrations/deploy/prj_f7cTIttkVrgmTPm7CWtGp16AgkwA/dYJvaXSeOu', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    
    return new Response("Rebuild triggered", {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}