import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #FF5F00, #CC3A00 45%, #131313)" }}
    >
      <SignUp />
    </main>
  );
}
