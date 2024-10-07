import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabSwitcher = () => {
  return (
    <Tabs defaultValue="signin">
      <TabsList>
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TabSwitcher;
