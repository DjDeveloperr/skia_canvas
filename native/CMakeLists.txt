cmake_minimum_required(VERSION 3.0.0)
project(native_canvas VERSION 0.1.0)

set (CMAKE_CXX_STANDARD 17)
# set (CMAKE_BUILD_TYPE Debug)
set (CMAKE_BUILD_TYPE Release)

include(CTest)
include_directories(. ../skia)
enable_testing()

add_library(native_canvas SHARED
  deps/csscolorparser.cpp
  src/common.cpp
  src/canvas.cpp
  src/context2d.cpp 
  src/font.cpp
  src/path2d.cpp
  src/image.cpp)

target_compile_options(native_canvas PRIVATE -Ofast -Wno-return-type -Wno-unused-result -Wno-write-strings -Wno-attributes)
# target_compile_options(native_canvas PRIVATE -g)

set (SKIA_OUT ${CMAKE_CURRENT_SOURCE_DIR}/../skia/out/Release)

target_link_directories(native_canvas PRIVATE ${SKIA_OUT})

target_link_libraries(native_canvas skia)
target_link_libraries(native_canvas "-Wl,--whole-archive ${SKIA_OUT}/libskshaper.a -Wl,--no-whole-archive")
target_link_libraries(native_canvas harfbuzz)
target_link_libraries(native_canvas pathkit)
target_link_libraries(native_canvas svg)
target_link_libraries(native_canvas skresources)
target_link_libraries(native_canvas skparagraph)
target_link_libraries(native_canvas particles)
target_link_libraries(native_canvas sktext)
target_link_libraries(native_canvas skunicode)
target_link_libraries(native_canvas skcms)
target_link_libraries(native_canvas freetype2)
target_link_libraries(native_canvas wuffs)
target_link_libraries(native_canvas icu)
target_link_libraries(native_canvas expat)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
