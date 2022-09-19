cmake_minimum_required(VERSION 3.0.0)
project(native_canvas VERSION 0.1.0)

set (CMAKE_CXX_STANDARD 17)

include(CTest)
include_directories(../skia)
enable_testing()

add_library(native_canvas SHARED native_canvas.cpp)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libskia.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libharfbuzz.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libpathkit.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libsksg.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libsvg.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libskresources.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libskshaper.a)
target_link_libraries(native_canvas ${CMAKE_SOURCE_DIR}/../skia/out/Static/libsktext.a)
target_link_libraries(native_canvas jpeg)
target_link_libraries(native_canvas webp)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
