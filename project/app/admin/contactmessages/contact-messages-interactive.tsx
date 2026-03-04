/**
 * Contact Messages Interactive Component - Client Component
 *
 * Handles interactive parts of contact messages page: data fetching, filtering, and table rendering
 */

"use client";

import React, { useEffect, useState, useMemo, startTransition } from "react";
import {
  MoreHorizontal,
  Mail,
  Loader2,
  AlertCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TimeService } from "@/shared/services/timezone/TimeService";
import { debugLog } from "@/shared/utils/debug";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useQueryFetcher } from "@/shared/hooks/use-query-fetcher";
import { queryKeys } from "@/shared/lib/query-keys";
import { useApp } from "@/shared/contexts/app-context";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ContactMessagesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

interface ContactMessagesResponse {
  messages: ContactMessage[];
  pagination: ContactMessagesPagination;
}

const DEFAULT_TIMEZONE = "UTC";
const DATE_FORMAT = "MMM d, yyyy h:mm a zzz";

const CONTACT_MESSAGES_PAGE_LIMIT = 20;

export function ContactMessagesInteractive() {
  const t = useTranslations();
  const { user } = useApp();
  const fetcher = useQueryFetcher<ContactMessagesResponse>();
  const [adminTimezone, setAdminTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize timezone detection
  useEffect(() => {
    const detectedTimezone = TimeService.getBrowserTimezone();
    debugLog.info(t("admin_detected_admin_timezone"), {
      service: "admin-contact-messages",
      operation: "detectTimezone",
      timezone: detectedTimezone,
    });
    // Use startTransition to batch state updates and avoid cascading renders
    startTransition(() => {
      setAdminTimezone(detectedTimezone);
    });
  }, [t]);

  const contactMessagesUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: CONTACT_MESSAGES_PAGE_LIMIT.toString(),
    });
    return `/api/shared/contact-messages?${params.toString()}`;
  }, [currentPage]);

  const {
    data: messagesResponse,
    error: messagesError,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.api.admin.contactMessages({
      page: currentPage,
      limit: CONTACT_MESSAGES_PAGE_LIMIT,
    }),
    queryFn: () => fetcher(contactMessagesUrl),
    enabled: !!user,
  });

  // Memoize messages array to prevent unnecessary re-renders
  const messages = useMemo(
    () => messagesResponse?.messages || [],
    [messagesResponse?.messages]
  );

  // Derive pagination for UI (match API shape from helpers/pagination)
  const pagination = useMemo(() => {
    const p = messagesResponse?.pagination;
    if (!p) {
      return {
        page: currentPage,
        limit: CONTACT_MESSAGES_PAGE_LIMIT,
        total: messages.length,
        totalPages:
          Math.ceil(messages.length / CONTACT_MESSAGES_PAGE_LIMIT) || 1,
        hasMore: false,
        hasPrevious: currentPage > 1,
      };
    }
    return {
      page: p.page,
      limit: p.limit,
      total: p.total,
      totalPages: p.totalPages,
      hasMore: p.hasMore ?? p.page < p.totalPages,
      hasPrevious: p.hasPrevious ?? p.page > 1,
    };
  }, [messagesResponse?.pagination, currentPage, messages.length]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const error = messagesError
    ? messagesError instanceof Error
      ? messagesError.message
      : t("admin_failed_to_fetch_contact_messages")
    : null;

  // Memoize formatted messages with timezone conversion
  const formattedMessages = useMemo(() => {
    return messages.map((msg) => ({
      ...msg,
      formattedDate: TimeService.formatWithLabel(
        TimeService.fromUTC(msg.createdAt, adminTimezone),
        adminTimezone,
        DATE_FORMAT
      ),
    }));
  }, [messages, adminTimezone]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {t("common_loading_contact_messages")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">
              {t("admin_contact_messages_error", { error })}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {t("admin_contact_messages_all_messages")}
            </CardTitle>
            <CardDescription className="mt-1">
              {t("admin_contact_messages_count", {
                count: pagination.total,
                message:
                  pagination.total === 1
                    ? t("admin_contact_messages_message_singular")
                    : t("admin_contact_messages_message_plural"),
              })}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Mail className="h-3 w-3 mr-1" />
            {pagination.total} {t("admin_contact_messages_total")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">
                  {t("admin_contact_messages_name")}
                </TableHead>
                <TableHead className="font-semibold">
                  {t("admin_settings_placeholder_email")}
                </TableHead>
                <TableHead className="font-semibold">
                  {t("admin_contact_messages_phone")}
                </TableHead>
                <TableHead className="font-semibold">
                  {t("admin_contact_messages_subject")}
                </TableHead>
                <TableHead className="font-semibold">
                  {t("admin_contact_messages_message")}
                </TableHead>
                <TableHead className="font-semibold">
                  {t("admin_contact_messages_received_at")}
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formattedMessages.length > 0 ? (
                formattedMessages.map((msg) => (
                  <ContactMessageRow key={msg.id} message={msg} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t("admin_contact_messages_no_messages")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t("common_pagination_showing", {
                page: pagination.page,
                totalPages: pagination.totalPages,
                total: pagination.total,
                item: t("common_pagination_messages"),
              })}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("common_pagination_previous")}
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const startPage = Math.max(1, pagination.page - 2);
                    const page = startPage + i;
                    if (page <= pagination.totalPages) {
                      return (
                        <Button
                          key={page}
                          variant={
                            pagination.page === page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    }
                    return null;
                  }
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasMore}
              >
                {t("common_pagination_next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoized row component to prevent unnecessary re-renders
const ContactMessageRow = React.memo(function ContactMessageRow({
  message,
}: {
  message: ContactMessage & { formattedDate: string };
}) {
  const t = useTranslations();

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{message.name}</TableCell>
      <TableCell>
        <a
          href={`mailto:${message.email}`}
          className="text-primary hover:underline"
        >
          {message.email}
        </a>
      </TableCell>
      <TableCell>
        {message.phone || <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {message.subject}
        </Badge>
      </TableCell>
      <TableCell className="max-w-md">
        <p className="text-sm line-clamp-2">{message.message}</p>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {message.formattedDate}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">
                {t("admin_contact_messages_actions")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {t("admin_contact_messages_actions")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground">
              {t("admin_contact_messages_no_actions_available")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
