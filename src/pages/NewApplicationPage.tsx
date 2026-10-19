import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";

import { useApplications } from "../hooks/useApplications";
import { STAGES, type NewApplication, type Stage } from "../types";

type Fields = {
  company: string;
  role: string;
  link: string;
  dateSent: string;
  stage: Stage;
  notes: string;
};

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function NewApplicationPage() {
  const navigate = useNavigate();
  const { add, error, saving } = useApplications();

  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({
    defaultValues: {
      company: "",
      role: "",
      link: "",
      dateSent: "",
      stage: "wishlist",
      notes: "",
    },
  });

  useEffect(() => {
    setFocus("company");
  }, [setFocus]);

  const selectedStage = watch("stage");

  async function onSubmit(values: Fields) {
    const application: NewApplication = {
      company: values.company.trim(),
      role: values.role.trim(),
      dateSent: values.dateSent,
      stage: values.stage,
      link: values.link.trim() || undefined,
      notes: values.notes.trim() || undefined,
    };

    try {
      await add(application);
      navigate("/applications");
    } catch {
      // useApplications already provides the error message
    }
  }

  return (
    <main>
      <Link to="/applications">← Back to applications</Link>

      <h1>Add an application</h1>

      <form
        className="panel form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <label htmlFor="company">Company *</label>

        <input
          id="company"
          aria-invalid={!!errors.company}
          aria-describedby={
            errors.company ? "company-error" : undefined
          }
          {...register("company", {
            required: "Company is required",

            validate: (value) =>
              value.trim().length >= 2 ||
              "At least 2 non-space characters",

            maxLength: {
              value: 120,
              message: "Company name is too long",
            },
          })}
        />

        {errors.company && (
          <p id="company-error" role="alert">
            {errors.company.message}
          </p>
        )}

        <label htmlFor="role">Job title *</label>

        <input
          id="role"
          aria-invalid={!!errors.role}
          aria-describedby={
            errors.role ? "role-error" : undefined
          }
          {...register("role", {
            required: "Job title is required",

            validate: (value) =>
              value.trim().length >= 2 ||
              "At least 2 non-space characters",

            maxLength: {
              value: 160,
              message: "Job title is too long",
            },
          })}
        />

        {errors.role && (
          <p id="role-error" role="alert">
            {errors.role.message}
          </p>
        )}

        <label htmlFor="link">
          Advert link (optional)
        </label>

        <input
          id="link"
          aria-invalid={!!errors.link}
          aria-describedby={
            errors.link ? "link-error" : undefined
          }
          {...register("link", {
            maxLength: {
              value: 2048,
              message: "That link is too long",
            },

            validate: (value) =>
              isValidUrl(value) ||
              "That does not look like a link",
          })}
        />

        {errors.link && (
          <p id="link-error" role="alert">
            {errors.link.message}
          </p>
        )}

        <label htmlFor="dateSent">
          Date sent{" "}
          {selectedStage !== "wishlist"
            ? "*"
            : "(not sent yet)"}
        </label>

        <input
          id="dateSent"
          type="date"
          max={getToday()}
          aria-invalid={!!errors.dateSent}
          aria-describedby={
            errors.dateSent ? "date-error" : undefined
          }
          {...register("dateSent", {
            validate: (value) => {
              if (selectedStage === "wishlist" && !value) {
                return true;
              }

              if (!value) {
                return "Date sent is required";
              }

              if (value > getToday()) {
                return "You cannot have sent it tomorrow";
              }

              return true;
            },
          })}
        />

        {errors.dateSent && (
          <p id="date-error" role="alert">
            {errors.dateSent.message}
          </p>
        )}

        <label htmlFor="stage">Stage</label>

        <select id="stage" {...register("stage")}>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage === "wishlist"
                ? "Saved"
                : stage}
            </option>
          ))}
        </select>

        <label htmlFor="notes">
          Notes (optional)
        </label>

        <textarea
          id="notes"
          rows={4}
          aria-invalid={!!errors.notes}
          aria-describedby={
            errors.notes
              ? "notes-error"
              : undefined
          }
          {...register("notes", {
            maxLength: {
              value: 10000,
              message: "Notes are too long",
            },
          })}
        />

        {errors.notes && (
          <p
            id="notes-error"
            role="alert"
          >
            {errors.notes.message}
          </p>
        )}

        <div className="actions">
          <button
            type="submit"
            disabled={isSubmitting || saving}
          >
            {isSubmitting || saving
              ? "Saving..."
              : "Save application"}
          </button>

          <Link to="/">Cancel</Link>
        </div>
      </form>
    </main>
  );
}