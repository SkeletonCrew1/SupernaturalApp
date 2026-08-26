package main

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestEraseHandler_RejectsGet(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/erase", nil)
	rec := httptest.NewRecorder()

	eraseHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status %d, got %d", http.StatusMethodNotAllowed, rec.Code)
	}
}

func TestWriteResponseToJSON(t *testing.T) {
	result := httptest.NewRecorder()
	payload := map[string]any{
		"status": "ok",
	}
	WriteResponseToJSON(result, http.StatusOK, payload)
	if result.Code != http.StatusOK {
		t.Errorf("Expected %d got %d", http.StatusOK, result.Code)
	}
	if ct := result.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %s", ct)
	}

}

func TestDBHealthCheck(t *testing.T) {
	var err error
	db, err = sql.Open("postgres", "postgres://user:password@localhost:1/unreal_db?sslmode=disable")
	if err != nil {
		t.Fatalf("Unexpected type of error %v", err)
	}
	defer db.Close()

	request := httptest.NewRequest(http.MethodGet, "/healthdb", nil)
	result := httptest.NewRecorder()

	DBHealthCheck(result, request)

	if result.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected %d got %d", http.StatusServiceUnavailable, result.Code)
	}

}

func TestEraseHandler_DBTruncate(t *testing.T) {
	fakeDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Something unexpected happened %v", err)
	}
	defer fakeDB.Close()

	db = fakeDB
	rows := sqlmock.NewRows([]string{"tablename"}).
		AddRow("one").
		AddRow("two")
	mock.ExpectQuery("SELECT tablename FROM pg_tables WHERE schemaname = 'public'").WillReturnRows(rows)
	mock.ExpectExec(`TRUNCATE TABLE "one", "two" RESTART IDENTITY CASCADE`).WillReturnResult(sqlmock.NewResult(0, 0))

	request := httptest.NewRequest(http.MethodPost, "/erase", nil)
	result := httptest.NewRecorder()

	eraseHandler(result, request)

	if result.Code != http.StatusOK {
		t.Errorf("Expected %d got %d", http.StatusOK, result.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Some expectations were not met %v", err)
	}
}
