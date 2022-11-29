cmake_minimum_required(VERSION 3.0.0)
project(native_canvas VERSION 0.1.0)

set (CMAKE_CXX_STANDARD 17)
# set (CMAKE_BUILD_TYPE Debug)
set (CMAKE_BUILD_TYPE Release)

include_directories(. ../skia)

add_library(native_canvas SHARED
  deps/csscolorparser.cpp
  src/common.cpp
  src/canvas.cpp
  src/context2d.cpp 
  src/font.cpp
  src/path2d.cpp
  src/image.cpp
  src/gradient.cpp
  src/pattern.cpp
  src/pdfdocument.cpp
  src/svgcanvas.cpp)

if (UNIX)
  target_compile_options(native_canvas PRIVATE
    -std=c++17
    -Ofast
    -Wno-return-type
    -Wno-unused-result
    -Wno-write-strings
    -Wno-attributes)
endif()

if (WIN32)
  target_compile_options(native_canvas PRIVATE
    /std:c++17
    /MT
    /W0)

  target_link_libraries(native_canvas
    gdi32
    user32
    kernel32
    opengl32)
endif()

# target_compile_options(native_canvas PRIVATE -g)

if(APPLE)
  target_link_libraries(native_canvas "-framework CoreFoundation")
  target_link_libraries(native_canvas "-framework CoreText")
  target_link_libraries(native_canvas "-framework CoreGraphics")
  target_link_libraries(native_canvas "-framework IOKit")
  target_link_libraries(native_canvas "-framework Cocoa")
  target_link_libraries(native_canvas "-framework OpenGL")
endif()

set (SKIA_OUT ${CMAKE_CURRENT_SOURCE_DIR}/../skia/out/Release)

target_link_directories(native_canvas PRIVATE ${SKIA_OUT})

if(UNIX AND NOT APPLE)
  target_link_libraries(native_canvas "-Wl,--whole-archive")
endif()

target_link_libraries(native_canvas skshaper)

if(UNIX AND NOT APPLE)
  target_link_libraries(native_canvas "-Wl,--no-whole-archive")
endif()

target_link_libraries(native_canvas
  skia
  harfbuzz
  svg
  pathkit
  skresources
  skparagraph
  particles
  sktext
  skunicode
  skcms
  freetype2
  wuffs
  icu
  expat)
