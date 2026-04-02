"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function AuthButton() {
    const { data: session, status } = useSession();

    // If we receive a RefreshTokenError, we must force the user to sign in again.
    useEffect(() => {
        if (session?.error === "RefreshTokenError") {
            signIn("google"); // Force sign in to obtain a new set of access and refresh tokens
        }
    }, [session?.error]);

    if (status === "loading") {
        return <span className="ui-meta-label text-muted-foreground">Session</span>;
    }

    if (session) {
        return (
            <div className="flex items-center gap-2">
                <p className="ui-meta-label hidden max-w-[220px] truncate text-muted-foreground sm:block">
                    {session.user?.email}
                </p>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => signOut()}
                >
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="ui-meta-label hidden text-muted-foreground sm:inline">Local mode</span>
            <Button
                type="button"
                size="sm"
                variant="outline"
            onClick={() => signIn("google")}
            >
                Connect
            </Button>
        </div>
    );
}
