#include "include/gradient.hpp"

extern "C" {
  sk_gradient* sk_gradient_create_linear(float startX, float startY, float endX, float endY) {
    sk_gradient* gradient = new sk_gradient();
    gradient->type = GradientType::Linear;
    gradient->transform = SkMatrix::I();
    gradient->data = new sk_linear_gradient();
    ((sk_linear_gradient*)gradient->data)->start = {startX, startY};
    ((sk_linear_gradient*)gradient->data)->end = {endX, endY};
    return gradient;
  }

  sk_gradient* sk_gradient_create_radial(float startCenterX, float startCenterY, float startRadius, float endCenterX, float endCenterY, float endRadius) {
    sk_gradient* gradient = new sk_gradient();
    gradient->type = GradientType::Radial;
    gradient->transform = SkMatrix::I();
    gradient->data = new sk_radial_gradient();
    ((sk_radial_gradient*)gradient->data)->startCenter = {startCenterX, startCenterY};
    ((sk_radial_gradient*)gradient->data)->startRadius = startRadius;
    ((sk_radial_gradient*)gradient->data)->endCenter = {endCenterX, endCenterY};
    ((sk_radial_gradient*)gradient->data)->endRadius = endRadius;
    return gradient;
  }

  sk_gradient* sk_gradient_create_conic(float centerX, float centerY, float radius) {
    sk_gradient* gradient = new sk_gradient();
    gradient->type = GradientType::Conic;
    gradient->transform = SkMatrix::I();
    gradient->data = new sk_conic_gradient();
    ((sk_conic_gradient*)gradient->data)->center = {centerX, centerY};
    ((sk_conic_gradient*)gradient->data)->radius = radius;
    return gradient;
  }

  void sk_gradient_destroy(sk_gradient* gradient) {
    free(gradient->data);
    delete gradient;
  }

  int sk_gradient_add_color_stop(sk_gradient* gradient, float position, char* style) {
    auto color = CSSColorParser::parse(std::string(style));
    if (color) {
      auto val = color.value();
      gradient->positions.push_back(position);
      gradient->colors.push_back(SkColorSetARGB((uint8_t)(val.a * 255), val.r, val.g, val.b));
      return 1;
    }
    return 0;
  }

  sk_sp<SkShader> sk_gradient_to_shader(sk_gradient* gradient, SkMatrix* ct) {
    SkColor colors[gradient->colors.size()];
    SkScalar positions[gradient->positions.size()];
    
    for (int i = 0; i < gradient->colors.size(); i++) {
      colors[i] = gradient->colors[i];
      positions[i] = gradient->positions[i];
    }

    switch (gradient->type) {
      case GradientType::Linear: {
        auto data = (sk_linear_gradient*)gradient->data;
        SkPoint points[] = {{data->start.x, data->start.y}, {data->end.x, data->end.y}};
        return SkGradientShader::MakeLinear(
          points,
          colors,
          positions,
          gradient->colors.size(),
          SkTileMode::kClamp,
          0,
          &gradient->transform
        );
      }

      case GradientType::Radial: {
        auto data = (sk_radial_gradient*)gradient->data;
        return SkGradientShader::MakeTwoPointConical(
          SkPoint::Make(data->startCenter.x, data->startCenter.y),
          data->startRadius,
          SkPoint::Make(data->endCenter.x, data->endCenter.y),
          data->endRadius,
          colors,
          positions,
          gradient->colors.size(),
          SkTileMode::kClamp,
          0,
          &gradient->transform
        );
      }

      case GradientType::Conic: {
        auto data = (sk_conic_gradient*)gradient->data;
        SkMatrix ts = gradient->transform;
        ts.preRotate(data->radius - 90.0, data->center.x, data->center.y);
        return SkGradientShader::MakeSweep(
          data->center.x,
          data->center.y,
          colors,
          positions,
          gradient->colors.size(),
          SkTileMode::kClamp,
          data->radius,
          360.0f,
          0,
          &gradient->transform
        );
      }
    }
  }
}
