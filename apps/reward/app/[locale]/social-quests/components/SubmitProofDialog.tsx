"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import DrawerDialog from "@/components/atoms/DrawerDialog";
import Input from "@/components/atoms/Input";
import Svg from "@/components/atoms/Svg";
import TextArea from "@/components/atoms/TextArea";
import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";
import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  onSubmit?: (payload: {
    links: string[];
    notes: string;
    files: File[];
  }) => void;
}

const MAX_LINKS = 5;
const MAX_NOTES_CHARS = 20_000;
const MAX_FILES = 6;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".png,.jpg,.jpeg,.pdf";
const ACCEPTED_MIMES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

interface AttachedFile {
  id: string;
  file: File;
  error?: string;
}

function isValidUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SubmitProofDialog({ isOpen, onOpenChange, onSubmit }: Props) {
  const t = useTranslations("SocialQuests");

  const [linkInput, setLinkInput] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLinkInput("");
      setLinkError(null);
      setLinks([]);
      setNotes("");
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const linkLimitReached = links.length >= MAX_LINKS;
  const notesCharCount = notes.length;
  const notesOverLimit = notesCharCount > MAX_NOTES_CHARS;
  const hasFileError = files.some((f) => f.error);

  const isValid =
    links.length > 0 && !notesOverLimit && !hasFileError && !linkError;

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      return;
    }
    if (!isValidUrl(trimmed)) {
      setLinkError(t("submit_proof_link_invalid"));
      return;
    }
    if (linkLimitReached) {
      return;
    }
    setLinks((prev) => [...prev, trimmed]);
    setLinkInput("");
    setLinkError(null);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddLink();
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected) {
      return;
    }
    const incoming = Array.from(selected);
    const room = Math.max(0, MAX_FILES - files.length);
    const next: AttachedFile[] = [];
    for (const file of incoming.slice(0, room)) {
      const isAccepted =
        ACCEPTED_MIMES.includes(file.type) ||
        /\.(png|jpe?g|pdf)$/i.test(file.name);
      let error: string | undefined;
      if (!isAccepted) {
        error = t("submit_proof_file_invalid_type");
      } else if (file.size > MAX_FILE_BYTES) {
        error = t("submit_proof_file_too_large");
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        error,
      });
    }
    setFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }
    onSubmit?.({
      links,
      notes,
      files: files.map((f) => f.file),
    });
    onOpenChange(false);
  };

  return (
    <DrawerDialog isOpen={isOpen} setIsOpen={onOpenChange} maxMobileWidth="560px">
      <div className="flex max-h-[90vh] w-[calc(100vw-24px)] max-w-[600px] flex-col rounded-5 bg-primary-bg shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-18 font-bold text-primary-text md:text-20">
            {t("submit_proof_title")}
          </h2>
          <IconButton
            variant={IconButtonVariant.CLOSE}
            handleClose={() => onOpenChange(false)}
          />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 md:px-6 md:pb-5">
          <div className="flex flex-col gap-2">
            <label className="text-14 font-medium text-primary-text">
              {t("submit_proof_links_label")}
            </label>
            <div className="flex items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Input
                  type="url"
                  value={linkInput}
                  onChange={(e) => {
                    setLinkInput(e.target.value);
                    if (linkError) {
                      setLinkError(null);
                    }
                  }}
                  onKeyDown={handleLinkKeyDown}
                  placeholder="https://"
                  isError={Boolean(linkError)}
                  disabled={linkLimitReached}
                />
                {linkError ? (
                  <p className="text-12 text-red-light">{linkError}</p>
                ) : null}
              </div>
              <IconButton
                variant={IconButtonVariant.ADD}
                handleAdd={handleAddLink}
                disabled={!linkInput.trim() || linkLimitReached}
                className="h-12 w-12 shrink-0"
              />
            </div>

            {links.length > 0 ? (
              <ul className="mt-1 flex max-h-[156px] flex-col gap-1 overflow-y-auto pr-1">
                {links.map((link, index) => (
                  <li
                    key={`${link}-${index}`}
                    className="flex min-w-0 items-center gap-2 rounded-2 bg-tertiary-bg px-3 py-2"
                  >
                    <Svg
                      iconName="external"
                      size={16}
                      className="shrink-0 text-secondary-text"
                    />
                    <span className="min-w-0 flex-1 truncate text-12 text-primary-text md:text-14">
                      {link}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="grid h-6 w-6 shrink-0 place-items-center text-secondary-text duration-200 hocus:text-primary-text"
                      aria-label={t("submit_proof_remove_link")}
                    >
                      <Svg iconName="close" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-14 font-medium text-primary-text">
              {t("submit_proof_notes_label")}
            </label>
            <TextArea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("submit_proof_notes_placeholder")}
              isError={notesOverLimit}
            />
            {notesOverLimit ? (
              <p className="text-12 text-red-light">
                {t("submit_proof_notes_over_limit", {
                  max: MAX_NOTES_CHARS,
                  entered: notesCharCount,
                })}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-14 font-medium text-primary-text">
              {t("submit_proof_attachments_label")}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={ButtonVariant.CONTAINED}
                colorScheme={ButtonColor.LIGHT_GREEN}
                size={ButtonSize.MEDIUM}
                mobileSize={ButtonSize.SMALL}
                onClick={handleBrowseClick}
                disabled={files.length >= MAX_FILES}
              >
                {t("submit_proof_browse")}
              </Button>
              <span className="text-12 text-secondary-text">
                {t("submit_proof_attachments_hint")}
              </span>
              <span className="ml-auto text-12 text-tertiary-text">
                {t("submit_proof_attachments_limit", {
                  max: MAX_FILES,
                  size: 10,
                })}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              multiple
              hidden
              onChange={handleFilesSelected}
            />

            {files.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {files.map((attachment) => (
                  <li key={attachment.id} className="flex flex-col gap-1">
                    <div
                      className={clsx(
                        "flex min-w-0 items-center gap-2 rounded-2 bg-tertiary-bg px-3 py-2",
                        attachment.error && "border border-red-light",
                      )}
                    >
                      <Svg
                        iconName="file"
                        size={16}
                        className="shrink-0 text-secondary-text"
                      />
                      <span className="min-w-0 flex-1 truncate text-12 text-primary-text md:text-14">
                        {attachment.file.name}
                      </span>
                      <span className="shrink-0 text-12 text-tertiary-text">
                        {formatBytes(attachment.file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(attachment.id)}
                        className="grid h-6 w-6 shrink-0 place-items-center text-secondary-text duration-200 hocus:text-primary-text"
                        aria-label={t("submit_proof_remove_file")}
                      >
                        <Svg iconName="close" size={16} />
                      </button>
                    </div>
                    {attachment.error ? (
                      <p className="text-12 text-red-light">{attachment.error}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {linkLimitReached ? (
            <div className="flex items-center gap-2 rounded-3 bg-tertiary-bg px-4 py-3 text-12 text-secondary-text">
              <Svg iconName="info" size={16} className="shrink-0 text-secondary-text" />
              <span>{t("submit_proof_link_limit_reached")}</span>
            </div>
          ) : null}

          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              variant={ButtonVariant.CONTAINED}
              colorScheme={ButtonColor.LIGHT_GREEN}
              size={ButtonSize.LARGE}
              mobileSize={ButtonSize.MEDIUM}
              onClick={() => onOpenChange(false)}
            >
              {t("submit_proof_cancel")}
            </Button>
            <Button
              variant={ButtonVariant.CONTAINED}
              colorScheme={ButtonColor.GREEN}
              size={ButtonSize.LARGE}
              mobileSize={ButtonSize.MEDIUM}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              {t("submit_proof_submit")}
            </Button>
          </div>
        </div>
      </div>
    </DrawerDialog>
  );
}
