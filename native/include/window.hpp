#include "include/context2d.hpp"
#include "include/common.hpp"

typedef GLFWwindow sk_window;

extern "C" {
  SKIA_EXPORT sk_window* sk_window_create(int width, int height, const char* title, bool visible);
  SKIA_EXPORT void sk_window_destroy(sk_window* window);
  SKIA_EXPORT void sk_window_show(sk_window* window);
  SKIA_EXPORT void sk_window_hide(sk_window* window);
  SKIA_EXPORT void sk_window_set_title(sk_window* window, const char* title);
  SKIA_EXPORT void sk_window_set_size(sk_window* window, int width, int height);
  SKIA_EXPORT void sk_window_set_position(sk_window* window, int x, int y);
  SKIA_EXPORT void sk_window_get_size(sk_window* window, int* width, int* height);
  SKIA_EXPORT void sk_window_get_position(sk_window* window, int* x, int* y);
  SKIA_EXPORT bool sk_window_draw_begin(sk_window* window);
  SKIA_EXPORT void sk_window_draw_end(sk_window* window, sk_canvas* canvas);
}
