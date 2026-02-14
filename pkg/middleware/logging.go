package middleware

import (
	"net/http"
	"time"

	"github.com/mustafakemalcelik/sitetakip/pkg/logger"
)

type responseWriter struct {
	http.ResponseWriter
	status int
	size   int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	n, err := rw.ResponseWriter.Write(b)
	rw.size += n
	return n, err
}

func StructuredLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		wrapped := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(wrapped, r)

		duration := time.Since(start)

		fields := map[string]interface{}{
			"method":      r.Method,
			"path":        r.URL.Path,
			"status":      wrapped.status,
			"duration_ms": duration.Milliseconds(),
			"size":        wrapped.size,
			"remote_addr": r.RemoteAddr,
			"user_agent":  r.UserAgent(),
		}

		if userID := GetUserID(r.Context()); userID != "" {
			fields["user_id"] = userID
		}

		if wrapped.status >= 500 {
			logger.Error("request_error", fields)
		} else if wrapped.status >= 400 {
			logger.Warn("request_warning", fields)
		} else {
			logger.Info("request", fields)
		}
	})
}
