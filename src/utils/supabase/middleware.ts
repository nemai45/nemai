import { getUserRole } from "@/lib/get-user-role";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = await getUserRole();

  if (
    user &&
    role !== "admin" &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    role === "admin" &&
    request.nextUrl.pathname.startsWith("/onboarding")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    role !== "admin" &&
    (request.nextUrl.pathname.startsWith("/customer-dashboard") ||
      request.nextUrl.pathname.startsWith("/artist-dashboard") ||
      request.nextUrl.pathname.startsWith("/onboarding"))
  ) {
    const { data, error } = await supabase
      .from("users")
      .select("onboarded")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("Error fetching user data:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (data && !data.onboarded && request.nextUrl.pathname !== "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    if (data && data.onboarded && request.nextUrl.pathname === "/onboarding") {
      switch (role) {
        case "artist":
          const url = request.nextUrl.clone();
          url.pathname = "/artist-dashboard";
          return NextResponse.redirect(url);
        case "customer":
          const url1 = request.nextUrl.clone();
          url1.pathname = "/customer-dashboard";
          return NextResponse.redirect(url1);
        default:
          break;
      }
    }
  }

  if (
    user &&
    role !== "artist" &&
    request.nextUrl.pathname.startsWith("/artist-dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    user &&
    role !== "customer" &&
    request.nextUrl.pathname.startsWith("/customer-dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !(request.nextUrl.pathname === "/")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    switch (role) {
      case "admin":
        url.pathname = "/admin";
        break;
      case "artist":
        url.pathname = "/artist-dashboard";
        break;
      case "customer":
        url.pathname = "/customer-dashboard";
        break;
      default:
        url.pathname = "/";
        break;
    }
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
