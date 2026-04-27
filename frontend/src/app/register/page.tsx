import { Button } from "~/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export default function Register() {
  return (
    <div className="bg-primary h-screen flex justify-center items-center flex-col">
      <div className="max-w-xs flex flex-col gap-14s">
        <h1 className="font-bold text-primary-foreground text-5xl">
          Erstelle einen Nutzer
        </h1>
        <div className="w-full mt-6">
          <form>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLegend>Email</FieldLegend>
                    <Input type="email" required />
                  </Field>
                  <Field>
                    <FieldLegend>Benutzer</FieldLegend>
                    <Input type="text" required />
                  </Field>
                  <Field>
                    <FieldLegend>Password</FieldLegend>
                    <Input type="password" required />
                  </Field>
                  <Field>
                    <Button className="text-primary hover:text-primary font-bold" type="submit" variant="outline" size="lg">
                      Anmelden
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
          <div className="text-sm text-primary-foreground mt-2">
            Du hast bereits einen Account?{" "}
            <a
              href="/login"
              className="font-bold text-primary-foreground hover:underline"
            >
              Melde dich an!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
