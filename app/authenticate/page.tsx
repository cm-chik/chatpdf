import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignUpForm from "./signUpForm";
import SignInForm from "./signInForm";
import { Button } from "@/components/ui/button";

export function AuthenticatePage() {
  return (
    <div className=" flex flex-col justify-center items-center h-screen gap-4">
      <Button className="w-[400px]">Sign In to Google</Button>
      <Tabs defaultValue="Sign Up" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Sign Up">Sign Up</TabsTrigger>
          <TabsTrigger value="Sign In">Sign In</TabsTrigger>
        </TabsList>
        <TabsContent value="Sign Up">
          <SignUpForm />
        </TabsContent>
        <TabsContent value="Sign In">
          <SignInForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AuthenticatePage;
