import { Button } from "~/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export default function Login() {
  return (
    <div className="bg-primary h-screen flex justify-center items-center flex-col">
      <div className="max-w-xs flex flex-col gap-14s">
        <h1 className="font-bold text-primary-foreground text-5xl">
          Willkommen zu Snapvent
        </h1>
        <div className="w-full">
          <form>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLegend>Email</FieldLegend>
                    <Input type="email" required />
                  </Field>
                  <Field>
                    <FieldLegend>Password</FieldLegend>
                    <Input type="password" required />
                  </Field>
                  <Field>
                    <Button type="submit" variant="outline" size="lg">
                      Login
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
          <div className="text-sm text-primary-foreground mt-2">
            Du hast noch keinen Account?{" "}
            <a
              href="/register"
              className="font-bold text-primary-foreground hover:underline"
            >
              Erstelle jetzt einen!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
