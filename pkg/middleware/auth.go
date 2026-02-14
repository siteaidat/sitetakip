package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/mustafakemalcelik/sitetakip/pkg/response"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const UserRoleKey contextKey = "user_role"

type TokenValidator interface {
	ValidateToken(token string) (userID string, role string, err error)
}

func Auth(validator TokenValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" {
				response.Error(w, http.StatusUnauthorized, "Authorization header required")
				return
			}

			token := strings.TrimPrefix(header, "Bearer ")
			if token == header {
				response.Error(w, http.StatusUnauthorized, "Invalid authorization format")
				return
			}

			userID, role, err := validator.ValidateToken(token)
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "Invalid token")
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			ctx = context.WithValue(ctx, UserRoleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserID(ctx context.Context) string {
	if v, ok := ctx.Value(UserIDKey).(string); ok {
		return v
	}
	return ""
}

func GetUserRole(ctx context.Context) string {
	if v, ok := ctx.Value(UserRoleKey).(string); ok {
		return v
	}
	return ""
}
