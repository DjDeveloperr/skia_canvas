#include "include/window.hpp"

extern "C" {
  sk_window* sk_window_create(int width, int height, const char* title, bool visible) {
    if (!visible) {
      glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
    } else {
      glfwWindowHint(GLFW_VISIBLE, GLFW_TRUE);
    }
    sk_window* window = glfwCreateWindow(width, height, title, NULL, NULL);
    if (window == NULL) {
      return nullptr;
    }
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);
    return window;
  }

  void sk_window_destroy(sk_window* window) {
    glfwDestroyWindow(window);
  }

  void sk_window_show(sk_window* window) {
    glfwShowWindow(window);
  }

  void sk_window_hide(sk_window* window) {
    glfwHideWindow(window);
  }

  void sk_window_set_title(sk_window* window, const char* title) {
    glfwSetWindowTitle(window, title);
  }

  void sk_window_set_size(sk_window* window, int width, int height) {
    glfwSetWindowSize(window, width, height);
  }

  void sk_window_set_position(sk_window* window, int x, int y) {
    glfwSetWindowPos(window, x, y);
  }

  void sk_window_get_size(sk_window* window, int* width, int* height) {
    glfwGetWindowSize(window, width, height);
  }

  void sk_window_get_position(sk_window* window, int* x, int* y) {
    glfwGetWindowPos(window, x, y);
  }

  bool sk_window_draw_begin(sk_window* window) {
    if (glfwWindowShouldClose(window)) {
      return false;
    }
    glfwMakeContextCurrent(window);
    glfwPollEvents();
    return true;
  }

  void sk_window_draw_end(sk_window* window, sk_canvas* canvas) {
    canvas->context->flush();
    glfwSwapBuffers(window);
  }
}
