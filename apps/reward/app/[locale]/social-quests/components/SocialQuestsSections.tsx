"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import {
  type EligibilityStat,
  type QuestConfidence,
  type QuestStatus,
  type QuestTask,
  type QuestWeight,
} from "@/app/[locale]/social-quests/data/socialQuestsData";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import { clsxMerge } from "@/functions/clsxMerge";

interface EligibilityProps {
  isConnected: boolean;
  stats: EligibilityStat[];
}

interface TasksProps {
  isConnected: boolean;
  tasks: QuestTask[];
  searchValue: string;
  onOpenDetails: (task: QuestTask) => void;
  onSubmitProof: (task: QuestTask) => void;
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
          {title}
        </h2>
        {description ? (
          <p className="text-12 leading-5 text-secondary-text lg:text-14">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}

function StatusPill({ isEligible, label }: { isEligible: boolean; label: string }) {
  return (
    <span
      className={clsxMerge(
        "inline-flex h-7 items-center rounded-20 px-3 text-12 font-medium",
        isEligible ? "bg-green-bg text-green" : "bg-red-bg text-red-light",
      )}
    >
      {label}
    </span>
  );
}

export function Eligibility({ isConnected, stats }: EligibilityProps) {
  const t = useTranslations("SocialQuests");

  return (
    <section className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <SectionHeader
        title={t("eligibility_title")}
        description={t("eligibility_description")}
        action={
          <StatusPill
            isEligible={isConnected}
            label={isConnected ? t("eligible") : t("ineligible")}
          />
        }
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {stats.map((item) => (
          <article className="rounded-3 bg-tertiary-bg p-4" key={item.label}>
            <span className="text-12 text-secondary-text">{t(item.label)}</span>
            <p className="mt-1 text-16 font-medium text-primary-text">
              {isConnected ? item.connectedValue : item.disconnectedValue}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TaskBadge({ children, tone }: { children: string; tone: "green" | "yellow" }) {
  return (
    <span
      className={clsxMerge(
        "inline-flex h-5 items-center rounded-20 px-2 text-10 leading-none",
        tone === "green" ? "bg-green-bg text-green" : "bg-yellow-bg text-yellow-light",
      )}
    >
      {children}
    </span>
  );
}

const weightLabelKey = {
  high: "weight_high",
  medium: "weight_medium",
} as const satisfies Record<QuestWeight, string>;

const weightBadgeKey = {
  high: "badge_high_weight",
  medium: "badge_medium_weight",
} as const satisfies Record<QuestWeight, string>;

const confidenceBadgeKey = {
  high: "badge_high_confidence",
  medium: "badge_medium_confidence",
} as const satisfies Record<QuestConfidence, string>;

const statusKey = {
  available: "submit_proof",
  submitted: "submitted",
  verified: "verified",
  rewarded: "rewarded",
  pending: "pending_review",
} as const satisfies Record<QuestStatus, string>;

function QuestTaskCard({
  task,
  isConnected,
  onOpenDetails,
  onSubmitProof,
}: {
  task: QuestTask;
  isConnected: boolean;
  onOpenDetails: (task: QuestTask) => void;
  onSubmitProof: (task: QuestTask) => void;
}) {
  const t = useTranslations("SocialQuests");
  const actionDisabled = !isConnected || task.status !== "available";
  const primaryLabel = isConnected ? t(statusKey[task.status]) : t(statusKey.available);

  return (
    <article className="flex min-w-0 flex-col rounded-3 bg-tertiary-bg p-4">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 flex-wrap gap-1">
          <TaskBadge tone="yellow">{t(weightBadgeKey[task.weight])}</TaskBadge>
          <TaskBadge tone={task.confidence === "high" ? "green" : "yellow"}>
            {t(confidenceBadgeKey[task.confidence])}
          </TaskBadge>
        </div>
        <div>
          <span className="text-12 text-secondary-text">{t(weightLabelKey[task.weight])}</span>
        </div>
      </div>

      <h3 className="mt-2 text-16 font-medium leading-5 text-primary-text">{task.title}</h3>

      <p className="mt-auto pt-3 text-12 text-secondary-text">
        {task.estimate}
        {task.autoBumped ? <span className="ml-1">{t("auto_bumped")}</span> : null}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button
          variant={ButtonVariant.CONTAINED}
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.SMALL}
          mobileSize={ButtonSize.SMALL}
          fullWidth
          onClick={() => onOpenDetails(task)}
        >
          {t("details")}
        </Button>
        <Button
          variant={ButtonVariant.CONTAINED}
          colorScheme={ButtonColor.LIGHT_GREEN}
          size={ButtonSize.SMALL}
          mobileSize={ButtonSize.SMALL}
          fullWidth
          disabled={actionDisabled}
          onClick={() => onSubmitProof(task)}
        >
          {primaryLabel}
        </Button>
      </div>
    </article>
  );
}

export function Tasks({
  isConnected,
  tasks,
  searchValue,
  onOpenDetails,
  onSubmitProof,
}: TasksProps) {
  const t = useTranslations("SocialQuests");

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredTasks = normalizedSearch
    ? tasks.filter((task) =>
        [task.title, task.estimate, t(weightLabelKey[task.weight])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : tasks;

  return (
    <section className="rounded-3 bg-primary-bg p-3 md:p-5 lg:p-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-20 font-medium leading-7 text-primary-text md:text-24 lg:text-28">
          {t("tasks_title")}
        </h2>
        <p className="text-12 leading-5 text-secondary-text lg:text-14">{t("tasks_description")}</p>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <QuestTaskCard
              isConnected={isConnected}
              key={task.id}
              task={task}
              onOpenDetails={onOpenDetails}
              onSubmitProof={onSubmitProof}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[150px] items-center justify-center rounded-3 bg-tertiary-bg px-5 text-center text-14 text-secondary-text">
          {t("no_tasks_match")}
        </div>
      )}

      <p className="mt-4 text-12 text-tertiary-text">{t("confidence_note")}</p>
    </section>
  );
}
