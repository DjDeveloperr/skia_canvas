cmake_minimum_required(VERSION 3.0.0)
project(native_canvas VERSION 0.1.0)

set (CMAKE_CXX_STANDARD 17)
set (CMAKE_BUILD_TYPE Release)

include(CTest)
include_directories(../skia)
enable_testing()

add_library(native_canvas SHARED native_canvas.cpp csscolorparser.cpp)

target_compile_options(native_canvas PRIVATE -Ofast)

target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libskia.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libharfbuzz.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libpathkit.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libsvg.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libskresources.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libskshaper.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Release/libsktext.a)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
